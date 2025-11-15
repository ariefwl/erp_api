// src/db.js
import dotenv from 'dotenv';
import sql from 'mssql';
dotenv.config();

const configBase = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  options: {
    encrypt: false,
    trustServerCertificate: false,
  }
};

// Buat pool untuk setiap database
const pools = {};

async function getPool(dbName) {
  try {
    if (!pools[dbName]) {
      console.log(`🔌 Creating pool for ${dbName}...`);
      const poolConfig = { ...configBase, database: dbName };
      pools[dbName] = new sql.ConnectionPool(poolConfig);
      await pools[dbName].connect();
      console.log(`✅ Pool created for ${dbName}`);
    }
    return pools[dbName];
  } catch (err) {
    console.error(`❌ Failed to create pool for ${dbName}:`, err.message);
    throw err;
  }
}

// Export pool untuk JIData (default) - sesuai dengan yang digunakan di index.js
export const poolPromise = getPool(process.env.DB_JIDATA);

// Export function untuk database lain jika diperlukan
export { getPool };

// Test function (opsional)
async function testConnections() {
  try {
    const dbs = [
      process.env.DB_JIDATA,
      process.env.DB_JI_MANUFACTURING,
      process.env.DB_BC_DATA
    ];

    for (const db of dbs) {
      const pool = await getPool(db);
      const result = await pool.request().query('SELECT TOP 1 name FROM sys.objects');
      console.log(`✅ Sample from ${db}:`, result.recordset[0]);
    }
  } catch (err) {
    console.error('Connection test failed:', err.message);
  }
}

// Jalankan test hanya jika file di-run langsung
if (import.meta.url === `file://${process.argv[1]}`) {
  testConnections();
}