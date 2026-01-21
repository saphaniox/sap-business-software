import { query } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';
import { deleteOldProfilePicture } from '../middleware/upload.js';
import bcrypt from 'bcryptjs';

// Create new user (Business Admin only)
export async function createUser(req, res) {
  const { username, email, password, role } = req.body;
  const companyId = req.companyId;

  try {
    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Username, email, and password are required' 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Validate role
    const validRoles = ['admin', 'manager', 'sales'];
    const userRole = role || 'sales';
    if (!validRoles.includes(userRole)) {
      return res.status(400).json({ 
        error: 'Invalid role. Must be one of: admin, manager, sales' 
      });
    }

    // Check if user already exists in THIS business
    const existingResult = await query(
      'SELECT * FROM users WHERE (username = ? OR email = ?) AND company_id = ? LIMIT 1',
      [username, email, companyId]
    );

    if (existingResult.length > 0) {
      return res.status(400).json({ 
        error: 'Username or email already exists in your business' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    const userId = uuidv4();
    const created_at = new Date().toISOString();
    
    await query(
      `INSERT INTO users (id, company_id, username, email, password_hash, role, is_company_admin, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, companyId, username, email, password_hash, userRole, false, created_at, created_at]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: userId,
        username,
        email,
        role: userRole,
        created_at
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function getAllUsers(req, res) {
  try {
    const companyId = req.companyId;

    // Get all users from THIS business
    const result = await query(
      'SELECT id, username, email, role, permissions, created_at FROM users WHERE company_id = ?',
      [companyId]
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getUserById(req, res) {
  const { id } = req.params;
  const companyId = req.companyId;

  try {
    const result = await query(
      'SELECT id, username, email, role, permissions, created_at FROM users WHERE id = ? AND company_id = ? LIMIT 1',
      [id, companyId]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateUser(req, res) {
  const { id } = req.params;
  const { username, email } = req.body;
  const companyId = req.companyId;

  try {
    // Check if user exists
    const checkResult = await query(
      'SELECT * FROM users WHERE id = ? AND company_id = ? LIMIT 1',
      [id, companyId]
    );

    if (checkResult.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (username) {
      updates.push('username = ?');
      values.push(username);
    }
    if (email) {
      updates.push('email = ?');
      values.push(email);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id, companyId);

    await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ? AND company_id = ?`,
      values
    );

    // Get updated user
    const updatedResult = await query(
      'SELECT id, username, email, role, permissions, created_at FROM users WHERE id = ? AND company_id = ? LIMIT 1',
      [id, companyId]
    );

    res.json({
      message: 'User updated successfully',
      user: updatedResult[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteUser(req, res) {
  const { id } = req.params;
  const companyId = req.companyId;

  try {
    // Check if user exists and is not company admin
    const userResult = await query(
      'SELECT * FROM users WHERE id = ? AND company_id = ? LIMIT 1',
      [id, companyId]
    );

    if (userResult.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult[0];

    if (user.is_company_admin) {
      return res.status(403).json({ 
        error: 'Cannot delete the company admin account' 
      });
    }

    // Delete user
    await query(
      'DELETE FROM users WHERE id = ? AND company_id = ?',
      [id, companyId]
    );

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateUserRole(req, res) {
  const { id } = req.params;
  const { role } = req.body;
  const companyId = req.companyId;

  try {
    // Validate role
    const validRoles = ['admin', 'manager', 'sales'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role. Must be one of: admin, manager, sales' 
      });
    }

    // Check if user exists
    const userResult = await query(
      'SELECT * FROM users WHERE id = ? AND company_id = ? LIMIT 1',
      [id, companyId]
    );

    if (userResult.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult[0];

    // Protect company admin from role changes
    if (user.is_company_admin && req.user.role !== 'superadmin') {
      return res.status(403).json({ 
        error: 'Cannot modify the primary admin account' 
      });
    }

    // Prevent demoting the last admin
    if (user.role === 'admin' && role !== 'admin') {
      const adminCountResult = await query(
        'SELECT COUNT(*) as count FROM users WHERE company_id = ? AND role = ?',
        [companyId, 'admin']
      );
      
      if (adminCountResult[0].count <= 1) {
        return res.status(400).json({ 
          error: 'Cannot demote the last admin user' 
        });
      }
    }

    // Update role
    await query(
      'UPDATE users SET role = ?, updated_at = ? WHERE id = ? AND company_id = ?',
      [role, new Date().toISOString(), id, companyId]
    );

    // Get updated user
    const updatedResult = await query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ? AND company_id = ? LIMIT 1',
      [id, companyId]
    );

    res.json({
      message: 'User role updated successfully',
      user: updatedResult[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateUserPermissions(req, res) {
  const { id } = req.params;
  const { permissions } = req.body;
  const companyId = req.companyId;

  try {
    // Validate permissions object
    if (!permissions || typeof permissions !== 'object') {
      return res.status(400).json({ 
        error: 'Invalid permissions data' 
      });
    }

    // Check if user exists
    const userResult = await query(
      'SELECT * FROM users WHERE id = ? AND company_id = ? LIMIT 1',
      [id, companyId]
    );

    if (userResult.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update permissions
    await query(
      'UPDATE users SET permissions = ?, updated_at = ? WHERE id = ? AND company_id = ?',
      [JSON.stringify(permissions), new Date().toISOString(), id, companyId]
    );

    res.json({ message: 'Permissions updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function uploadProfilePicture(req, res) {
  const { id } = req.params;
  const companyId = req.companyId;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check if user exists
    const userResult = await query(
      'SELECT * FROM users WHERE id = ? AND company_id = ? LIMIT 1',
      [id, companyId]
    );

    if (userResult.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult[0];

    // Delete old profile picture if exists
    if (user.profile_picture) {
      await deleteOldProfilePicture(user.profile_picture);
    }

    // Update profile picture path
    const picturePath = req.file.filename;
    await query(
      'UPDATE users SET profile_picture = ?, updated_at = ? WHERE id = ? AND company_id = ?',
      [picturePath, new Date().toISOString(), id, companyId]
    );

    res.json({
      message: 'Profile picture uploaded successfully',
      profile_picture: picturePath
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteProfilePicture(req, res) {
  const { id } = req.params;
  const companyId = req.companyId;

  try {
    // Check if user exists
    const userResult = await query(
      'SELECT * FROM users WHERE id = ? AND company_id = ? LIMIT 1',
      [id, companyId]
    );

    if (userResult.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult[0];

    if (user.profile_picture) {
      await deleteOldProfilePicture(user.profile_picture);
    }

    // Remove profile picture
    await query(
      'UPDATE users SET profile_picture = NULL, updated_at = ? WHERE id = ? AND company_id = ?',
      [new Date().toISOString(), id, companyId]
    );

    res.json({ message: 'Profile picture deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getProfilePicture(req, res) {
  const { id } = req.params;
  const companyId = req.companyId;

  try {
    const result = await query(
      'SELECT profile_picture FROM users WHERE id = ? AND company_id = ? LIMIT 1',
      [id, companyId]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ profile_picture: result[0].profile_picture });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function adminChangePassword(req, res) {
  const { id } = req.params;
  const { newPassword } = req.body;
  const companyId = req.companyId;

  try {
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user exists
    const userResult = await query(
      'SELECT * FROM users WHERE id = ? AND company_id = ? LIMIT 1',
      [id, companyId]
    );

    if (userResult.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    // Update password
    await query(
      'UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ? AND company_id = ?',
      [password_hash, new Date().toISOString(), id, companyId]
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function changeOwnPassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;
  const companyId = req.companyId;

  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Current and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'New password must be at least 6 characters long' 
      });
    }

    // Get user
    const userResult = await query(
      'SELECT * FROM users WHERE id = ? AND company_id = ? LIMIT 1',
      [userId, companyId]
    );

    if (userResult.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult[0];

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    // Update password
    await query(
      'UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ? AND company_id = ?',
      [password_hash, new Date().toISOString(), userId, companyId]
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
