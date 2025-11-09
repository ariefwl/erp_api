import express from 'express';
import cors from 'cors';
import { poolPromise } from './db.js';
import dotenv from 'dotenv';
import purchase from './routes/purchase.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;


app.use('/api/purchase', purchase);

// Test endpoint untuk cek koneksi
app.get('/api/test-db', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT @@VERSION as version');
    res.json({ 
      success: true, 
      database: 'connected',
      version: result.recordset[0].version 
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Database connection failed', 
      details: error.message 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// ERPUser endpoint
app.get('/api/erpuser', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT TOP 10 * FROM ERPUser');
    res.json(result.recordset);
  } catch (error) {
    console.error('ERPUser query error:', error);
    res.status(500).json({ 
      error: 'database error', 
      details: error.message 
    });
  }
});

// Databases endpoint
app.get('/api/databases', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT name, database_id FROM sys.databases');
    res.json(result.recordset);
  } catch (err) {
    console.error('Databases query error:', err);
    res.status(500).json({ 
      error: 'database error', 
      details: err.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});