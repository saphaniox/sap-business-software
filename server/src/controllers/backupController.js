import { query } from '../db/connection.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Backup Controller
 * Database backup and restore functionality
 */

const BACKUP_DIR = path.join(process.cwd(), 'backups');

/**
 * Create database backup
 */
export async function createBackup(req, res) {
  try {
    const companyId = req.companyId;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${companyId}-${timestamp}.json`;
    const filepath = path.join(BACKUP_DIR, filename);

    // Ensure backup directory exists
    await fs.mkdir(BACKUP_DIR, { recursive: true });

    // Fetch all data for this company
    const [
      users,
      products,
      customers,
      sales,
      invoices,
      expenses,
      returns,
      notifications,
      announcements,
      supportTickets,
      auditLogs
    ] = await Promise.all([
      query('SELECT * FROM users WHERE company_id = ?', [companyId]),
      query('SELECT * FROM products WHERE company_id = ?', [companyId]),
      query('SELECT * FROM customers WHERE company_id = ?', [companyId]),
      query('SELECT * FROM sales WHERE company_id = ?', [companyId]),
      query('SELECT * FROM invoices WHERE company_id = ?', [companyId]),
      query('SELECT * FROM expenses WHERE company_id = ?', [companyId]),
      query('SELECT * FROM returns WHERE company_id = ?', [companyId]),
      query('SELECT * FROM notifications WHERE user_id IN (SELECT id FROM users WHERE company_id = ?)', [companyId]),
      query('SELECT * FROM announcements WHERE company_id = ?', [companyId]),
      query('SELECT * FROM support_tickets WHERE company_id = ?', [companyId]),
      query('SELECT * FROM audit_logs WHERE company_id = ?', [companyId])
    ]);

    const backupData = {
      metadata: {
        company_id: companyId,
        backup_date: new Date().toISOString(),
        created_by: req.user.username
      },
      data: {
        users: users.rows,
        products: products.rows,
        customers: customers.rows,
        sales: sales.rows,
        invoices: invoices.rows,
        expenses: expenses.rows,
        returns: returns.rows,
        notifications: notifications.rows,
        announcements: announcements.rows,
        support_tickets: supportTickets.rows,
        audit_logs: auditLogs.rows
      }
    };

    await fs.writeFile(filepath, JSON.stringify(backupData, null, 2), 'utf8');

    res.json({
      message: 'Backup created successfully',
      filename,
      filepath,
      size: (await fs.stat(filepath)).size
    });
  } catch (error) {
    console.error('Create backup error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * List all backups
 */
export async function listBackups(req, res) {
  try {
    const companyId = req.companyId;

    // Ensure backup directory exists
    await fs.mkdir(BACKUP_DIR, { recursive: true });

    const files = await fs.readdir(BACKUP_DIR);
    const companyBackups = files.filter(f => f.includes(companyId) && f.endsWith('.json'));

    const backups = await Promise.all(
      companyBackups.map(async (filename) => {
        const filepath = path.join(BACKUP_DIR, filename);
        const stats = await fs.stat(filepath);
        return {
          filename,
          size: stats.size,
          created_at: stats.birthtime
        };
      })
    );

    res.json({ backups: backups.sort((a, b) => b.created_at - a.created_at) });
  } catch (error) {
    console.error('List backups error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Download backup file
 */
export async function downloadBackup(req, res) {
  try {
    const { filename } = req.params;
    const companyId = req.companyId;

    // Security check - ensure filename belongs to this company
    if (!filename.includes(companyId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const filepath = path.join(BACKUP_DIR, filename);

    try {
      await fs.access(filepath);
    } catch {
      return res.status(404).json({ error: 'Backup file not found' });
    }

    res.download(filepath);
  } catch (error) {
    console.error('Download backup error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Delete backup file
 */
export async function deleteBackup(req, res) {
  try {
    const { filename } = req.params;
    const companyId = req.companyId;

    // Security check
    if (!filename.includes(companyId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const filepath = path.join(BACKUP_DIR, filename);

    try {
      await fs.unlink(filepath);
      res.json({ message: 'Backup deleted successfully' });
    } catch {
      return res.status(404).json({ error: 'Backup file not found' });
    }
  } catch (error) {
    console.error('Delete backup error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Restore from backup (admin only - use with caution!)
 */
export async function restoreBackup(req, res) {
  try {
    const { filename } = req.params;
    const companyId = req.companyId;

    // Security check
    if (!filename.includes(companyId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const filepath = path.join(BACKUP_DIR, filename);
    const backupContent = await fs.readFile(filepath, 'utf8');
    const backupData = JSON.parse(backupContent);

    // Verify backup belongs to this company
    if (backupData.metadata.company_id !== companyId) {
      return res.status(403).json({ error: 'Backup does not belong to this company' });
    }

    // Note: Full restore is complex and risky
    // This is a placeholder - in production, implement proper restore logic
    // with transaction support and data validation

    res.json({
      message: 'Restore functionality is not yet fully implemented',
      backup_info: backupData.metadata
    });
  } catch (error) {
    console.error('Restore backup error:', error);
    res.status(500).json({ error: error.message });
  }
}
