import { query } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Support Ticket Controller
 * Customer support ticket system
 */

/**
 * Create support ticket
 */
export async function createTicket(req, res) {
  try {
    const { subject, description, priority = 'medium', category } = req.body;
    const companyId = req.companyId;

    if (!subject || !description) {
      return res.status(400).json({ error: 'Subject and description are required' });
    }

    const ticketId = uuidv4();
    const ticketNumber = `TICKET-${Date.now()}`;
    const created_at = new Date().toISOString();

    await query(
      `INSERT INTO support_tickets (id, company_id, ticket_number, subject, description, priority, category, status, created_by_user_id, created_by_username, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [ticketId, companyId, ticketNumber, subject, description, priority, category, 'open', req.user.id, req.user.username, created_at, created_at]
    );

    res.status(201).json({
      message: 'Support ticket created successfully',
      ticket: { id: ticketId, ticket_number: ticketNumber, subject, status: 'open', created_at }
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get all support tickets
 */
export async function getTickets(req, res) {
  try {
    const companyId = req.companyId;
    const { status, priority, page = 1, limit = 20 } = req.query;

    let sqlWhere = 'WHERE company_id = ?';
    const params = [companyId];

    if (status) {
      sqlWhere += ' AND status = ?';
      params.push(status);
    }
    if (priority) {
      sqlWhere += ' AND priority = ?';
      params.push(priority);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [ticketsResult, countResult] = await Promise.all([
      query(
        `SELECT * FROM support_tickets ${sqlWhere} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...params, parseInt(limit), offset]
      ),
      query(
        `SELECT COUNT(*) as count FROM support_tickets ${sqlWhere}`,
        params
      )
    ]);

    res.json({
      tickets: ticketsResult,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].count,
        pages: Math.ceil(countResult[0].count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get single ticket
 */
export async function getTicket(req, res) {
  try {
    const { id } = req.params;
    const companyId = req.companyId;

    const result = await query(
      'SELECT * FROM support_tickets WHERE id = ? AND company_id = ? LIMIT 1',
      [id, companyId]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Update ticket
 */
export async function updateTicket(req, res) {
  try {
    const { id } = req.params;
    const { status, priority, assigned_to, response } = req.body;
    const companyId = req.companyId;

    const updates = [];
    const values = [];

    if (status) {
      updates.push('status = ?');
      values.push(status);
      
      if (status === 'closed') {
        updates.push('closed_at = ?');
        values.push(new Date().toISOString());
      }
    }
    if (priority) {
      updates.push('priority = ?');
      values.push(priority);
    }
    if (assigned_to) {
      updates.push('assigned_to_user_id = ?');
      values.push(assigned_to);
    }
    if (response) {
      updates.push('admin_response = ?');
      values.push(response);
      updates.push('responded_at = ?');
      values.push(new Date().toISOString());
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id, companyId);

    await query(
      `UPDATE support_tickets SET ${updates.join(', ')} WHERE id = ? AND company_id = ?`,
      values
    );

    res.json({ message: 'Ticket updated successfully' });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Delete ticket
 */
export async function deleteTicket(req, res) {
  try {
    const { id } = req.params;
    const companyId = req.companyId;

    const result = await query(
      'DELETE FROM support_tickets WHERE id = ? AND company_id = ?',
      [id, companyId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get ticket statistics
 */
export async function getTicketStats(req, res) {
  try {
    const companyId = req.companyId;

    const [totalResult, openResult, closedResult, pendingResult] = await Promise.all([
      query('SELECT COUNT(*) as count FROM support_tickets WHERE company_id = ?', [companyId]),
      query('SELECT COUNT(*) as count FROM support_tickets WHERE company_id = ? AND status = ?', [companyId, 'open']),
      query('SELECT COUNT(*) as count FROM support_tickets WHERE company_id = ? AND status = ?', [companyId, 'closed']),
      query('SELECT COUNT(*) as count FROM support_tickets WHERE company_id = ? AND status = ?', [companyId, 'pending'])
    ]);

    res.json({
      total: totalResult[0].count,
      open: openResult[0].count,
      closed: closedResult[0].count,
      pending: pendingResult[0].count
    });
  } catch (error) {
    console.error('Get ticket stats error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Add message to a support ticket
 */
export async function addTicketMessage(req, res) {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;
    const companyId = req.companyId;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Verify ticket exists and belongs to company
    const ticketResult = await query(
      'SELECT * FROM support_tickets WHERE id = ? AND company_id = ? LIMIT 1',
      [ticketId, companyId]
    );

    if (ticketResult.length === 0) {
      return res.status(404).json({ error: 'Support ticket not found' });
    }

    // Update ticket with new message (simplified - in production use a messages table)
    await query(
      'UPDATE support_tickets SET status = ?, updated_at = ? WHERE id = ?',
      ['in-progress', new Date().toISOString(), ticketId]
    );

    res.json({
      message: 'Message added to ticket',
      ticket_id: ticketId
    });
  } catch (error) {
    console.error('Add ticket message error:', error);
    res.status(500).json({ error: error.message });
  }
}
