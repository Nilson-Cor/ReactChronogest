const db = require('./db');
const bcrypt = require('bcrypt');

function initializeDatabase() {
    console.log('Inicializando base de datos SQLite...');

    // Crear tabla usuarios (adaptada del schema original)
    db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      usuario TEXT UNIQUE,
      telefono TEXT,
      correo TEXT UNIQUE,
      contrasena TEXT NOT NULL,
      tipoDocumento TEXT,
      numeroDocumento INTEGER,
      activo INTEGER DEFAULT 1,
      Rol TEXT DEFAULT 'aprendiz'
    )
  `);
    console.log('✓ Tabla usuarios creada');

    // Crear tabla centros
    db.exec(`
    CREATE TABLE IF NOT EXISTS centros (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      direccion TEXT,
      telefono TEXT,
      activo INTEGER DEFAULT 1
    )
  `);
    console.log('✓ Tabla centros creada');

    // Crear tabla ambientes
    db.exec(`
    CREATE TABLE IF NOT EXISTS ambientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      descripcion TEXT,
      capacidad INTEGER,
      centro_id INTEGER,
      activo INTEGER DEFAULT 1,
      FOREIGN KEY (centro_id) REFERENCES centros(id)
    )
  `);
    console.log('✓ Tabla ambientes creada');

    // Crear tabla programas
    db.exec(`
    CREATE TABLE IF NOT EXISTS programas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      descripcion TEXT,
      duracion INTEGER,
      activo INTEGER DEFAULT 1
    )
  `);
    console.log('✓ Tabla programas creada');

    // Crear tabla fichas
    db.exec(`
    CREATE TABLE IF NOT EXISTS fichas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero TEXT,
      programa_id INTEGER,
      jornada TEXT,
      fecha_inicio TEXT,
      fecha_fin TEXT,
      activo INTEGER DEFAULT 1,
      FOREIGN KEY (programa_id) REFERENCES programas(id)
    )
  `);
    console.log('✓ Tabla fichas creada');

    // Crear tabla instructores
    db.exec(`
    CREATE TABLE IF NOT EXISTS instructores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER,
      especialidad TEXT,
      programa_id INTEGER,
      activo INTEGER DEFAULT 1,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
      FOREIGN KEY (programa_id) REFERENCES programas(id)
    )
  `);
    console.log('✓ Tabla instructores creada');

    // Crear tabla horarios
    db.exec(`
    CREATE TABLE IF NOT EXISTS horarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ficha_id INTEGER,
      instructor_id INTEGER,
      ambiente_id INTEGER,
      dia_semana TEXT,
      hora_inicio TEXT,
      hora_fin TEXT,
      competencia TEXT,
      fecha_creacion TEXT,
      estado TEXT DEFAULT 'Activo',
      FOREIGN KEY (ficha_id) REFERENCES fichas(id),
      FOREIGN KEY (instructor_id) REFERENCES instructores(id),
      FOREIGN KEY (ambiente_id) REFERENCES ambientes(id)
    )
  `);
    console.log('✓ Tabla horarios creada');

    // Crear tabla asignacion_horarios
    db.exec(`
    CREATE TABLE IF NOT EXISTS asignacion_horarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      instructor_id INTEGER,
      ficha_id INTEGER,
      fecha TEXT,
      hora TEXT,
      motivo TEXT,
      prioridad TEXT DEFAULT 'Media',
      estado TEXT DEFAULT 'Pendiente',
      FOREIGN KEY (instructor_id) REFERENCES instructores(id),
      FOREIGN KEY (ficha_id) REFERENCES fichas(id)
    )
  `);
    console.log('✓ Tabla asignacion_horarios creada');

    // Crear usuarios de prueba
    console.log('Creando usuarios de prueba...');

    const password1Hash = bcrypt.hashSync('admin123', 10);
    const password2Hash = bcrypt.hashSync('instructor123', 10);
    const password3Hash = bcrypt.hashSync('aprendiz123', 10);

    const insertUser = db.prepare(`
    INSERT OR IGNORE INTO usuarios 
    (nombre, usuario, correo, contrasena, Rol, tipoDocumento, numeroDocumento, activo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

    insertUser.run('Admin User', 'admin1', 'admin@chronogest.com', password1Hash, 'admin', 'CC', 1234567890, 1);
    insertUser.run('Instructor User', 'instructor1', 'instructor@chronogest.com', password2Hash, 'instructor', 'CC', 9876543210, 1);
    insertUser.run('Aprendiz User', 'aprendiz1', 'aprendiz@chronogest.com', password3Hash, 'aprendiz', 'CC', 5555555555, 1);

    console.log('✓ Usuarios de prueba creados:');
    console.log('  - admin1 / admin123');
    console.log('  - instructor1 / instructor123');
    console.log('  - aprendiz1 / aprendiz123');

    console.log('✓ Base de datos inicializada exitosamente');
}

// Ejecutar inicialización si se corre directamente
if (require.main === module) {
    try {
        initializeDatabase();
        console.log('\n✅ Inicialización completada');
    } catch (error) {
        console.error('❌ Error inicializando base de datos:', error);
        process.exit(1);
    }
}

module.exports = { initializeDatabase };
