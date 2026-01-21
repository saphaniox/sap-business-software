import { query } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Notification Controller
 * Handles in-app notifications for users
 */

/**
 * Create a notification
 */
export async function createNotification(req, res) {
  try {
    const { user_id, type, title, message, link, priority = 'normal' } = req.body;

    if (!user_id || !title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const notificationId = uuidv4();
    const created_at = new Date().toISOString();

    await query(
      `INSERT INTO notifications (id, user_id, type, title, message, link, priority, is_read, created_at, read_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [notificationId, user_id, type, title, message, link, priority, false, created_at, null]
    );

    res.json({
      success: true,
      notification: { id: notificationId, user_id, type, title, message, link, priority, is_read: false, created_at, read_at: null }
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create notification'
    });
  }
}

/**
 * Get notifications for current user
 */
export async function getNotifications(req, res) {
  try {
    const userId = req.user.id;
    const { unread_only, limit = 50, skip = 0 } = req.query;

    let sqlWhere = 'WHERE user_id = ?';
    const params = [userId];
    
    if (unread_only === 'true') {
      sqlWhere += ' AND is_read = false';
    }

    const [notificationsResult, unreadCountResult] = await Promise.all([
      query(
        `SELECT * FROM notifications ${sqlWhere} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...params, parseInt(limit), parseInt(skip)]
      ),
      query(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = false',
        [userId]
      )
    ]);

    res.json({
      success: true,
      notifications: notificationsResult,
      unread_count: unreadCountResult[0].count,
      total: notificationsResult.length
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications'
    });
  }
}

/**
 * Mark notification as read
 */
export async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await query(
      'UPDATE notifications SET is_read = true, read_at = ? WHERE id = ? AND user_id = ?',
      [new Date().toISOString(), id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read'
    });
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(req, res) {
  try {
    const userId = req.user.id;

    await query(
      'UPDATE notifications SET is_read = true, read_at = ? WHERE user_id = ? AND is_read = false',
      [new Date().toISOString(), userId]
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark all notifications as read'
    });
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await query(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete notification'
    });
  }
}

/**
 * Delete all notifications for user
 */
export async function deleteAllNotifications(req, res) {
  try {
    const userId = req.user.id;

    await query(
      'DELETE FROM notifications WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'All notifications deleted'
    });
  } catch (error) {
    console.error('Delete all notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete all notifications'
    });
  }
}

/**
 * Get unread count
 */
export async function getUnreadCount(req, res) {
  try {
    const userId = req.user.id;

    const result = await query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = false',
      [userId]
    );

    res.json({
      success: true,
      count: result[0].count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get unread count'
    });
  }
}

/**
 * Clear all read notifications
 */
export async function clearReadNotifications(req, res) {
  try {
    const userId = req.user.id;

    await query(
      'DELETE FROM notifications WHERE user_id = ? AND is_read = true',
      [userId]
    );

    res.json({
      success: true,
      message: 'Read notifications cleared'
    });
  } catch (error) {
    console.error('Clear read notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear read notifications'
    });
  }
}
