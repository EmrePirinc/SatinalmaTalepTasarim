import express from 'express';
import db from '../database/db.js';

const router = express.Router();

// Login endpoint
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Kullanıcı adı ve şifre gereklidir' });
    }

    const user = db.prepare(`
      SELECT id, sap_id, username, name, role, purchase_authority, finance_authority, status
      FROM users
      WHERE username = ? AND password = ? AND status = 'active'
    `).get(username, password);

    if (!user) {
      return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        sapId: user.sap_id,
        username: user.username,
        name: user.name,
        role: user.role,
        purchaseAuthority: user.purchase_authority === 1,
        financeAuthority: user.finance_authority === 1
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Get all users (Admin only)
router.get('/users', (req, res) => {
  try {
    const users = db.prepare(`
      SELECT id, sap_id, username, name, role, purchase_authority, finance_authority, status, created_at
      FROM users
      ORDER BY created_at DESC
    `).all();

    const formattedUsers = users.map(user => ({
      id: user.id,
      sapId: user.sap_id,
      username: user.username,
      name: user.name,
      role: user.role,
      purchaseAuthority: user.purchase_authority === 1,
      financeAuthority: user.finance_authority === 1,
      status: user.status,
      createdAt: user.created_at
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Create user (Admin only)
router.post('/users', (req, res) => {
  try {
    const { sapId, username, password, name, role, purchaseAuthority, financeAuthority } = req.body;

    if (!sapId || !username || !password || !name || !role) {
      return res.status(400).json({ error: 'Zorunlu alanlar eksik' });
    }

    const insert = db.prepare(`
      INSERT INTO users (sap_id, username, password, name, role, purchase_authority, finance_authority, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
    `);

    const result = insert.run(
      sapId,
      username,
      password,
      name,
      role,
      purchaseAuthority ? 1 : 0,
      financeAuthority ? 1 : 0
    );

    res.json({
      success: true,
      userId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Create user error:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Kullanıcı adı veya SAP ID zaten mevcut' });
    }
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Update user (Admin only)
router.put('/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, purchaseAuthority, financeAuthority, status } = req.body;

    const update = db.prepare(`
      UPDATE users
      SET name = ?, role = ?, purchase_authority = ?, finance_authority = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    update.run(name, role, purchaseAuthority ? 1 : 0, financeAuthority ? 1 : 0, status, id);

    res.json({ success: true });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

export default router;
