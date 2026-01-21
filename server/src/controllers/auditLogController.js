import { query } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Audit Log Controller
 * Tracks all important system actions
 */

/**
 * Create audit log entry
 */
export async function createAuditLog(req, res) {
  try {
    const { action, entity_type, entity_id, details } = req.body;
    const companyId = req.companyId;

    const logId = uuidv4();
    const created_at = new Date().toISOString();

    await query(
      `INSERT INTO audit_logs (id, company_id, user_id, user_name, action, entity_type, entity_id, details, ip_address, user_agent, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        logId,
        companyId,
        req.user.id,
        req.user.user_name,
        action,
        entity_type,
        entity_id,
        JSON.stringify(details),
        req.ip,
        req.get('user-agent'),
        created_at
      ]
    );

    res.status(201).json({
      message: 'Audit log created',
      log_id: logId
    });
  } catch (error) {
    console.error('Create audit log error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get audit logs with filtering
 */
export async function getAuditLogs(req, res) {
  try {
    const companyId = req.companyId;
    const { 
      user_id, 
      action, 
      entity_type, 
      start_date, 
      end_date,
      page = 1, 
      limit = 50 
    } = req.query;

    let sqlWhere = 'WHERE company_id = ?';
    const params = [companyId];

    if (user_id) {
      sqlWhere += ' AND user_id = ?';
      params.push(user_id);
    }
    if (action) {
      sqlWhere += ' AND action = ?';
      params.push(action);
    }
    if (entity_type) {
      sqlWhere += ' AND entity_type = ?';
      params.push(entity_type);
    }
    if (start_date) {
      sqlWhere += ' AND created_at >= ?';
      params.push(start_date);
    }
    if (end_date) {
      sqlWhere += ' AND created_at <= ?';
      params.push(end_date);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [logsResult, countResult] = await Promise.all([
      query(
        `SELECT * FROM audit_logs ${sqlWhere} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...params, parseInt(limit), offset]
      ),
      query(
        `SELECT COUNT(*) as count FROM audit_logs ${sqlWhere}`,
        params
      )
    ]);

    // Parse details JSON
    const logs = logsResult.map(log => ({
      ...log,
      details: typeof log.details === 'string' ? JSON.parse(log.details) : log.details
    }));

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].count,
        pages: Math.ceil(countResult[0].count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get single audit log
 */
export async function getAuditLog(req, res) {
  try {
    const { id } = req.params;
    const companyId = req.companyId;

    const result = await query(
      'SELECT * FROM audit_logs WHERE id = ? AND company_id = ? LIMIT 1',
      [id, companyId]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: 'Audit log not found' });
    }

    const log = result[0];
    log.details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;

    res.json(log);
  } catch (error) {
    console.error('Get audit log error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Delete old audit logs (cleanup)
 */
export async function deleteOldLogs(req, res) {
  try {
    const { days = 90 } = req.query;
    const companyId = req.companyId;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const result = await query(
      'DELETE FROM audit_logs WHERE company_id = ? AND created_at < ?',
      [companyId, cutoffDate.toISOString()]
    );

    res.json({
      message: 'Old audit logs deleted',
      deleted_count: result.affectedRows
    });
  } catch (error) {
    console.error('Delete old logs error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get audit logs for a specific target
 */
export async function getTargetAuditLogs(req, res) {
  try {
    const { targetId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const companyId = req.companyId;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [logsResult, countResult] = await Promise.all([
      query(
        `SELECT * FROM audit_logs WHERE company_id = ? AND entity_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [companyId, targetId, parseInt(limit), offset]
      ),
      query(
        `SELECT COUNT(*) as count FROM audit_logs WHERE company_id = ? AND entity_id = ?`,
        [companyId, targetId]
      )
    ]);

    const logs = logsResult.map(log => ({
      ...log,
      details: typeof log.details === 'string' ? JSON.parse(log.details) : log.details
    }));

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].count,
        pages: Math.ceil(countResult[0].count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get target audit logs error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get audit log statistics
 */
export async function getAuditStats(req, res) {
  try {
    const companyId = req.companyId;

    const [actionStats, entityStats, userActivity, recentActivity] = await Promise.all([
      // Action type distribution
      query(
        `SELECT action, COUNT(*) as count FROM audit_logs WHERE company_id = ? GROUP BY action ORDER BY count DESC`,
        [companyId]
      ),
      // Entity type distribution
      query(
        `SELECT entity_type, COUNT(*) as count FROM audit_logs WHERE company_id = ? GROUP BY entity_type ORDER BY count DESC`,
        [companyId]
      ),
      // Top active users
      query(
        `SELECT user_name, COUNT(*) as action_count FROM audit_logs WHERE company_id = ? GROUP BY user_name ORDER BY action_count DESC LIMIT 10`,
        [companyId]
      ),
      // Recent activity (last 24 hours)
      query(
        `SELECT COUNT(*) as count FROM audit_logs WHERE company_id = ? AND created_at >= ?`,
        [companyId, new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()]
      )
    ]);

    res.json({
      action_distribution: actionStats,
      entity_distribution: entityStats,
      top_users: userActivity,
      recent_activity_24h: recentActivity[0].count
    });
  } catch (error) {
    console.error('Get audit stats error:', error);
    res.status(500).json({ error: error.message });
  }
}
