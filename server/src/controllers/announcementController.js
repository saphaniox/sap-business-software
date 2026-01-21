import { query } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Announcement Controller
 * Platform-wide or company-specific announcements
 */

/**
 * Create announcement (Admin only)
 */
export async function createAnnouncement(req, res) {
  try {
    const { title, content, type = 'info', target = 'all' } = req.body;
    const companyId = req.companyId;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const announcementId = uuidv4();
    const created_at = new Date().toISOString();

    await query(
      `INSERT INTO announcements (id, company_id, title, content, type, target, created_by_user_id, created_by_username, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [announcementId, companyId, title, content, type, target, req.user.id, req.user.username, created_at, created_at]
    );

    res.status(201).json({
      message: 'Announcement created successfully',
      announcement: { id: announcementId, title, content, type, target, created_at }
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get all announcements
 */
export async function getAnnouncements(req, res) {
  try {
    const companyId = req.companyId;
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [announcementsResult, countResult] = await Promise.all([
      query(
        'SELECT * FROM announcements WHERE company_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [companyId, parseInt(limit), offset]
      ),
      query(
        'SELECT COUNT(*) as count FROM announcements WHERE company_id = ?',
        [companyId]
      )
    ]);

    res.json({
      announcements: announcementsResult,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].count,
        pages: Math.ceil(countResult[0].count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get single announcement
 */
export async function getAnnouncement(req, res) {
  try {
    const { id } = req.params;
    const companyId = req.companyId;

    const result = await query(
      'SELECT * FROM announcements WHERE id = ? AND company_id = ? LIMIT 1',
      [id, companyId]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Get announcement error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Update announcement
 */
export async function updateAnnouncement(req, res) {
  try {
    const { id } = req.params;
    const { title, content, type, target } = req.body;
    const companyId = req.companyId;

    const updates = [];
    const values = [];

    if (title) {
      updates.push('title = ?');
      values.push(title);
    }
    if (content) {
      updates.push('content = ?');
      values.push(content);
    }
    if (type) {
      updates.push('type = ?');
      values.push(type);
    }
    if (target) {
      updates.push('target = ?');
      values.push(target);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id, companyId);

    await query(
      `UPDATE announcements SET ${updates.join(', ')} WHERE id = ? AND company_id = ?`,
      values
    );

    res.json({ message: 'Announcement updated successfully' });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Delete announcement
 */
export async function deleteAnnouncement(req, res) {
  try {
    const { id } = req.params;
    const companyId = req.companyId;

    const result = await query(
      'DELETE FROM announcements WHERE id = ? AND company_id = ?',
      [id, companyId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get company-wide announcements
 */
export async function getCompanyAnnouncements(req, res) {
  try {
    const companyId = req.companyId;
    const { page = 1, limit = 10 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [announcementsResult, countResult] = await Promise.all([
      query(
        `SELECT * FROM announcements WHERE company_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [companyId, parseInt(limit), offset]
      ),
      query(
        `SELECT COUNT(*) as count FROM announcements WHERE company_id = ?`,
        [companyId]
      )
    ]);

    res.json({
      announcements: announcementsResult,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].count,
        pages: Math.ceil(countResult[0].count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get company announcements error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Mark announcement as read
 */
export async function markAnnouncementRead(req, res) {
  try {
    const { announcementId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // This could track which users have read which announcements
    // For now, just acknowledge the request
    res.json({ 
      message: 'Announcement marked as read',
      announcement_id: announcementId,
      user_id: userId
    });
  } catch (error) {
    console.error('Mark announcement read error:', error);
    res.status(500).json({ error: error.message });
  }
}
