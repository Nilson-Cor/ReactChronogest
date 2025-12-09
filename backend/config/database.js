const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'chronogest_bd',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(connection => {
    console.log('✓ Conexión a la base de datos exitosa');
    connection.release();
  })
  .catch(err => {
    console.error('✗ Error conectando a la base de datos:', err.message);
  });

module.exports = pool;