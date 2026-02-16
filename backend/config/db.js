const Database = require('better-sqlite3');
const path = require('path');

// Ruta a la base de datos SQLite
const dbPath = path.join(__dirname, '..', 'chronogest.db');

// Crear conexión
const db = new Database(dbPath, { 
  verbose: console.log,
  fileMustExist: false 
});

// Habilitar WAL mode para mejor concurrencia
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log('✓ Conectado a SQLite database en:', dbPath);

module.exports = db;
