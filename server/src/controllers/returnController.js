import { query } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';

// Create a new return/refund request
export async function createReturn(req, res) {
  const { order_id, items, reason, refund_method = 'cash' } = req.body;

  try {
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Return must have at least one item' });
    }

    const companyId = req.companyId;

    // Verify order exists
    const orderResult = await query(
      'SELECT * FROM sales WHERE id = ? AND company_id = ? LIMIT 1',
      [order_id, companyId]
    );
    const order = orderResult[0];
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Parse items if stored as JSON
    const orderItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;

    // Calculate refund amount and validate items
    let refundAmount = 0;
    const returnItems = [];

    for (const item of items) {
      const orderItem = orderItems.find(
        oi => oi.product_id === item.product_id
      );

      if (!orderItem) {
        return res.status(400).json({ 
          error: `Product ${item.product_id} not found in order` 
        });
      }

      if (item.quantity > orderItem.quantity) {
        return res.status(400).json({ 
          error: `Return quantity (${item.quantity}) exceeds ordered quantity (${orderItem.quantity}) for ${orderItem.product_name}` 
        });
      }

      const itemRefund = orderItem.unit_price * item.quantity;
      refundAmount += itemRefund;

      returnItems.push({
        product_id: item.product_id,
        product_name: orderItem.product_name,
        quantity: item.quantity,
        unit_price: orderItem.unit_price,
        refund_amount: itemRefund
      });
    }

    // Create return record
    const returnId = uuidv4();
    const returnNumber = `RET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;\n    \n    await query(
      `INSERT INTO returns (id, company_id, sale_id, customer_name, return_number, items, total, reason, refund_method, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [returnId, companyId, order_id, order.customer_name, returnNumber, JSON.stringify(returnItems), refundAmount, reason, refund_method, 'pending', req.user.id]
    );

    res.status(201).json({
      message: 'Return request created successfully',
      return: { id: returnId, order_id, customer_name: order.customer_name, items: returnItems, total_refund_amount: refundAmount, status: 'pending' }
    });
  } catch (error) {
    console.error('Create return error:', error);
    res.status(500).json({ error: error.message });
  }
}

// Get all returns with pagination
export async function getReturns(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const status = req.query.status;

  try {
    const companyId = req.companyId;

    let sqlWhere = 'WHERE company_id = ?';
    const params = [companyId];
    
    if (status) {
      sqlWhere += ' AND status = ?';
      params.push(status);
    }

    const returnsResult = await query(
      `SELECT * FROM returns ${sqlWhere} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, skip]
    );
    
    const countResult = await query(
      `SELECT COUNT(*) as total FROM returns ${sqlWhere}`,
      params
    );
    const total = countResult[0].total;

    res.json({
      data: returnsResult,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get returns error:', error);
    res.status(500).json({ error: error.message });
  }
}

// Get single return by ID
export async function getReturn(req, res) {
  const { id } = req.params;

  try {
    const companyId = req.companyId;

    const result = await query(
      'SELECT * FROM returns WHERE id = ? AND company_id = ? LIMIT 1',
      [id, companyId]
    );
    const returnRecord = result[0];

    if (!returnRecord) {
      return res.status(404).json({ error: 'Return not found' });
    }

    res.json(returnRecord);
  } catch (error) {
    console.error('Get return error:', error);
    res.status(500).json({ error: error.message });
  }
}

// Approve return and restore inventory
export async function approveReturn(req, res) {
  const { id } = req.params;

  try {
    const companyId = req.companyId;

    // Get return record
    const returnResult = await query(
      'SELECT * FROM returns WHERE id = ? AND company_id = ? LIMIT 1',
      [id, companyId]
    );
    const returnRecord = returnResult[0];
    
    if (!returnRecord) {
      return res.status(404).json({ error: 'Return not found' });
    }

    if (returnRecord.status !== 'pending') {
      return res.status(400).json({ error: `Cannot approve return with status: ${returnRecord.status}` });
    }

    // Parse items if stored as JSON
    const returnItems = typeof returnRecord.items === 'string' ? JSON.parse(returnRecord.items) : returnRecord.items;

    // Get the original sales order
    const salesOrderResult = await query(
      'SELECT * FROM sales WHERE id = ? AND company_id = ? LIMIT 1',
      [returnRecord.order_id, companyId]
    );
    const salesOrder = salesOrderResult[0];
    
    if (!salesOrder) {
      return res.status(404).json({ error: 'Original sales order not found' });
    }

    const salesOrderItems = typeof salesOrder.items === 'string' ? JSON.parse(salesOrder.items) : salesOrder.items;

    // Restore inventory for each item
    for (const item of returnItems) {
      // Update product stock
      await query(
        'UPDATE products SET quantity = quantity + ?, updated_at = ? WHERE id = ? AND company_id = ?',
        [item.quantity, new Date().toISOString(), item.product_id, companyId]
      );

      // Create stock transaction record if table exists
      try {
        const transactionId = uuidv4();
        await query(
          `INSERT INTO stock_transactions (id, company_id, product_id, product_name, transaction_type, quantity, reference_id, reference_type, performed_by, performed_by_username, notes, transaction_date, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            transactionId,
            companyId,
            item.product_id,
            item.product_name,
            'return',
            item.quantity,
            returnRecord.id,
            'return',
            req.user.id,
            req.user.username,
            `Return approved - Reason: ${returnRecord.reason}`,
            new Date().toISOString(),
            new Date().toISOString()
          ]
        );
      } catch (err) {
        console.log('Stock transactions table may not exist:', err.message);
      }
    }

    // Update the sales order to reflect the refund
    const updatedItems = salesOrderItems.map(orderItem => {
      const returnedItem = returnItems.find(
        ri => ri.product_id === orderItem.product_id
      );
      
      if (returnedItem) {
        const newQuantity = orderItem.quantity - returnedItem.quantity;
        const newTotal = orderItem.unit_price * newQuantity;
        const newProfit = orderItem.item_profit ? (orderItem.item_profit / orderItem.quantity) * newQuantity : 0;
        
        return {
          ...orderItem,
          quantity: newQuantity,
          total_price: newTotal,
          item_profit: newProfit,
          returned_quantity: (orderItem.returned_quantity || 0) + returnedItem.quantity
        };
      }
      return orderItem;
    }).filter(item => item.quantity > 0);

    // Recalculate order totals
    const newSubtotal = updatedItems.reduce((sum, item) => sum + item.total_price, 0);
    const newTotalProfit = updatedItems.reduce((sum, item) => sum + (item.item_profit || 0), 0);
    const totalRefunded = (salesOrder.total_refunded || 0) + returnRecord.total_refund_amount;

    // Update the sales order
    await query(
      `UPDATE sales SET items = ?, subtotal = ?, total = ?, total_profit = ?, has_returns = ?, total_refunded = ?, updated_at = ? WHERE id = ? AND company_id = ?`,
      [
        JSON.stringify(updatedItems),
        newSubtotal,
        newSubtotal,
        newTotalProfit,
        true,
        totalRefunded,
        new Date().toISOString(),
        returnRecord.order_id,
        companyId
      ]
    );

    // Update return status
    await query(
      `UPDATE returns SET status = ?, approved_by_user_id = ?, approved_by_username = ?, approved_at = ?, updated_at = ? WHERE id = ? AND company_id = ?`,
      ['approved', req.user.id, req.user.username, new Date().toISOString(), new Date().toISOString(), id, companyId]
    );

    // Get updated return
    const updatedReturnResult = await query(
      'SELECT * FROM returns WHERE id = ? AND company_id = ? LIMIT 1',
      [id, companyId]
    );

    res.json({
      message: 'Return approved, inventory restored, and financials updated',
      return: updatedReturnResult[0],
      refund_amount: returnRecord.total_refund_amount,
      updated_order_total: newSubtotal
    });
  } catch (error) {
    console.error('Approve return error:', error);
    res.status(500).json({ error: error.message });
  }
}

// Reject return
export async function rejectReturn(req, res) {
  const { id } = req.params;
  const { rejection_reason } = req.body;

  try {
    const companyId = req.companyId;

    // Check return exists and is pending
    const returnResult = await query(
      'SELECT * FROM returns WHERE id = ? AND company_id = ? LIMIT 1',
      [id, companyId]
    );
    const returnRecord = returnResult[0];
    
    if (!returnRecord) {
      return res.status(404).json({ error: 'Return not found' });
    }

    if (returnRecord.status !== 'pending') {
      return res.status(400).json({ error: `Cannot reject return with status: ${returnRecord.status}` });
    }

    // Update return status
    await query(
      `UPDATE returns SET status = ?, rejection_reason = ?, rejected_by_user_id = ?, rejected_by_username = ?, rejected_at = ?, updated_at = ? WHERE id = ? AND company_id = ?`,
      ['rejected', rejection_reason, req.user.id, req.user.username, new Date().toISOString(), new Date().toISOString(), id, companyId]
    );

    // Get updated return
    const updatedReturnResult = await query(
      'SELECT * FROM returns WHERE id = ? AND company_id = ? LIMIT 1',
      [id, companyId]
    );

    res.json({
      message: 'Return rejected',
      return: updatedReturnResult[0]
    });
  } catch (error) {
    console.error('Reject return error:', error);
    res.status(500).json({ error: error.message });
  }
}

// Delete return (admin only)
export async function deleteReturn(req, res) {
  const { id } = req.params;

  try {
    const companyId = req.companyId;

    // Check if return exists
    const returnResult = await query(
      'SELECT * FROM returns WHERE id = ? AND company_id = ? LIMIT 1',
      [id, companyId]
    );
    
    if (returnResult.length === 0) {
      return res.status(404).json({ error: 'Return not found' });
    }

    // Delete the return
    await query(
      'DELETE FROM returns WHERE id = ? AND company_id = ?',
      [id, companyId]
    );

    res.json({ message: 'Return deleted successfully' });
  } catch (error) {
    console.error('Delete return error:', error);
    res.status(500).json({ error: error.message });
  }
}
