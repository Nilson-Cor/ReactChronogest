const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,       // localhost
  user: process.env.DB_USER,       // chronogest
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 60000
});

// Conexión simple (SIN reintentos)
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✓ Conexión a la base de datos exitosa');
    connection.release();
  } catch (err) {
    console.error('✗ Error conectando a la base de datos:', err.message);
    process.exit(1); // corta el servidor si no hay DB
  }
})();

module.exports = pool;