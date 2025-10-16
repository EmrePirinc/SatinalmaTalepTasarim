import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { initDatabase } from './database/db.js';
import authRoutes from './routes/auth.js';
import requestRoutes from './routes/requests.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Initialize database
initDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Satınalma API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Sunucu hatası' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Satınalma API sunucusu http://localhost:${PORT} adresinde çalışıyor`);
  console.log(`📊 Veritabanı: SQLite`);
  console.log(`🔗 API endpoints:`);
  console.log(`   - POST   /api/auth/login`);
  console.log(`   - GET    /api/auth/users`);
  console.log(`   - POST   /api/auth/users`);
  console.log(`   - PUT    /api/auth/users/:id`);
  console.log(`   - GET    /api/requests`);
  console.log(`   - POST   /api/requests`);
  console.log(`   - PUT    /api/requests/:id`);
  console.log(`   - GET    /api/requests/next-doc-number`);
});
