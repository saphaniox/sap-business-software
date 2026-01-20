import { query } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Platform Settings Controller
 * Manages global platform configuration
 */

/**
 * Get all platform settings
 */
export async function getSettings(req, res) {
  try {
    const result = await query(
      'SELECT * FROM platform_settings ORDER BY category, setting_key'
    );

    // Group settings by category
    const grouped = {};
    result.rows.forEach(setting => {
      if (!grouped[setting.category]) {
        grouped[setting.category] = {};
      }
      grouped[setting.category][setting.setting_key] = {
        value: typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value,
        description: setting.description,
        data_type: setting.data_type
      };
    });

    res.json({ settings: grouped });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get single setting
 */
export async function getSetting(req, res) {
  try {
    const { category, key } = req.params;

    const result = await query(
      'SELECT * FROM platform_settings WHERE category = ? AND setting_key = ? LIMIT 1',
      [category, key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    const setting = result.rows[0];
    setting.value = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;

    res.json(setting);
  } catch (error) {
    console.error('Get setting error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Update or create setting
 */
export async function updateSetting(req, res) {
  try {
    const { category, key } = req.params;
    const { value, description, data_type = 'string' } = req.body;

    // Check if setting exists
    const checkResult = await query(
      'SELECT * FROM platform_settings WHERE category = ? AND setting_key = ? LIMIT 1',
      [category, key]
    );

    const valueStr = JSON.stringify(value);

    if (checkResult.rows.length > 0) {
      // Update existing
      await query(
        'UPDATE platform_settings SET value = ?, description = ?, data_type = ?, updated_at = ? WHERE category = ? AND setting_key = ?',
        [valueStr, description, data_type, new Date().toISOString(), category, key]
      );
    } else {
      // Create new
      const settingId = uuidv4();
      await query(
        `INSERT INTO platform_settings (id, category, setting_key, value, description, data_type, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [settingId, category, key, valueStr, description, data_type, new Date().toISOString(), new Date().toISOString()]
      );
    }

    res.json({ message: 'Setting updated successfully' });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Delete setting
 */
export async function deleteSetting(req, res) {
  try {
    const { category, key } = req.params;

    const result = await query(
      'DELETE FROM platform_settings WHERE category = ? AND setting_key = ?',
      [category, key]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    console.error('Delete setting error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get settings by category
 */
export async function getSettingsByCategory(req, res) {
  try {
    const { category } = req.params;

    const result = await query(
      'SELECT * FROM platform_settings WHERE category = ? ORDER BY setting_key',
      [category]
    );

    const settings = {};
    result.rows.forEach(setting => {
      settings[setting.setting_key] = {
        value: typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value,
        description: setting.description,
        data_type: setting.data_type
      };
    });

    res.json({ category, settings });
  } catch (error) {
    console.error('Get settings by category error:', error);
    res.status(500).json({ error: error.message });
  }
}
