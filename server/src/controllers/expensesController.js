import { query } from '../db/connection.js'
import { v4 as uuidv4 } from 'uuid'
import { addCompanyContext, createCompanyFilter } from '../middleware/tenantContext.js'

/**
 * Create a new expense record
 */
export const createExpense = async (req, res) => {
  try {
    const { amount, description, category, date } = req.body
    const userId = req.user?.userId
    const companyId = req.companyId

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' })
    }

    if (!description || description.trim() === '') {
      return res.status(400).json({ error: 'Description is required' })
    }

    // Create expense with SQL
    const expenseId = uuidv4();
    const expenseDate = date ? new Date(date) : new Date();
    
    await query(
      `INSERT INTO expenses (id, company_id, amount, description, category, date, user_id, username, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [expenseId, companyId, parseFloat(amount), description.trim(), category?.trim() || null, expenseDate, userId, req.user?.username || 'Unknown']
    );

    const result = await query(
      'SELECT * FROM expenses WHERE id = ? AND company_id = ? LIMIT 1',
      [expenseId, companyId]
    );

    res.status(201).json({
      message: 'Expense recorded successfully',
      data: result[0]
    })
  } catch (error) {
    console.error('Error creating expense:', error)
    res.status(500).json({ error: 'Failed to record expense' })
  }
}

/**
 * Get all expenses with pagination and filters
 */
export const getAllExpenses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 50
    const skip = (page - 1) * limit

    const { startDate, endDate, category } = req.query
    const companyId = req.companyId

    // Build SQL query with filters
    let sqlWhere = 'WHERE company_id = ?';
    const params = [companyId];
    
    if (startDate) {
      sqlWhere += ' AND date >= ?';
      params.push(new Date(startDate));
    }
    if (endDate) {
      sqlWhere += ' AND date <= ?';
      params.push(new Date(endDate));
    }

    if (category && category !== 'all') {
      sqlWhere += ' AND category = ?';
      params.push(category);
    }

    const expensesResult = await query(
      `SELECT * FROM expenses ${sqlWhere} ORDER BY date DESC, created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, skip]
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM expenses ${sqlWhere}`,
      params
    );
    
    const total = countResult[0].total

    res.json({
      data: expensesResult,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching expenses:', error)
    res.status(500).json({ error: 'Failed to fetch expenses' })
  }
}

/**
 * Get expenses summary for a date range
 */
export const getExpensesSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    const companyId = req.companyId
    
    // Build SQL query with filters
    let sqlWhere = 'WHERE company_id = ?';
    const params = [companyId];
    
    if (startDate) {
      sqlWhere += ' AND date >= ?';
      params.push(new Date(startDate));
    }
    if (endDate) {
      sqlWhere += ' AND date <= ?';
      params.push(new Date(endDate));
    }

    const summaryResult = await query(
      `SELECT SUM(amount) as totalExpenses, COUNT(*) as count FROM expenses ${sqlWhere}`,
      params
    );

    // Get breakdown by category
    const byCategoryResult = await query(
      `SELECT category, SUM(amount) as total, COUNT(*) as count 
       FROM expenses ${sqlWhere} 
       GROUP BY category 
       ORDER BY total DESC`,
      params
    );

    res.json({
      totalExpenses: summaryResult[0]?.totalExpenses || 0,
      totalCount: summaryResult[0]?.count || 0,
      byCategory: byCategoryResult.map(item => ({
        category: item.category || 'Uncategorized',
        total: item.total,
        count: item.count
      }))
    })
  } catch (error) {
    console.error('Error fetching expenses summary:', error)
    res.status(500).json({ error: 'Failed to fetch expenses summary' })
  }
}

/**
 * Update an expense record
 */
export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params
    const { amount, description, category, date } = req.body
    const companyId = req.companyId

    // Build dynamic UPDATE query
    const updateFields = [];
    const updateParams = [];

    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({ error: 'Amount must be greater than 0' })
      }
      updateFields.push('amount = ?');
      updateParams.push(parseFloat(amount));
    }

    if (description !== undefined) {
      if (description.trim() === '') {
        return res.status(400).json({ error: 'Description cannot be empty' })
      }
      updateFields.push('description = ?');
      updateParams.push(description.trim());
    }

    if (category !== undefined) {
      updateFields.push('category = ?');
      updateParams.push(category?.trim() || null);
    }

    if (date !== undefined) {
      updateFields.push('date = ?');
      updateParams.push(new Date(date));
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' })
    }

    updateFields.push('updated_at = NOW()');
    updateParams.push(id, companyId);

    const result = await query(
      `UPDATE expenses SET ${updateFields.join(', ')} WHERE id = ? AND company_id = ?`,
      updateParams
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Expense not found' })
    }

    const updatedResult = await query(
      'SELECT * FROM expenses WHERE id = ? AND company_id = ? LIMIT 1',
      [id, companyId]
    );

    res.json({
      message: 'Expense updated successfully',
      data: updatedResult[0]
    })
  } catch (error) {
    console.error('Error updating expense:', error)
    res.status(500).json({ error: 'Failed to update expense' })
  }
}

/**
 * Delete an expense record
 */
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params
    const companyId = req.companyId

    const result = await query(
      'DELETE FROM expenses WHERE id = ? AND company_id = ?',
      [id, companyId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Expense not found' })
    }

    res.json({ message: 'Expense deleted successfully' })
  } catch (error) {
    console.error('Error deleting expense:', error)
    res.status(500).json({ error: 'Failed to delete expense' })
  }
}


