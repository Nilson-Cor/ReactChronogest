const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'chronogest_bd',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 60000
});

// Función para intentar conectar con reintentos
async function connectWithRetry(retries = 10, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await pool.getConnection();
      console.log('✓ Conexión a la base de datos exitosa');
      connection.release();
      return;
    } catch (err) {
      console.log(`⏳ Intento ${i + 1}/${retries} - Esperando MySQL...`);
      if (i === retries - 1) {
        console.error('✗ Error conectando a la base de datos:', err.message);
      } else {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}

connectWithRetry();

module.exports = pool;