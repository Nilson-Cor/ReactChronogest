const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log('1. Login iniciado para usuario:', username);

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Usuario y contraseña son requeridos'
      });
    }

    // Buscar usuario en SQLite (síncrono con better-sqlite3)
    const user = db.prepare('SELECT * FROM usuarios WHERE usuario = ? AND activo = 1').get(username);

    console.log('2. Usuario encontrado:', user ? 'SÍ' : 'NO');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario o contraseña incorrectos'
      });
    }

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.contrasena);

    console.log('3. Password coincide:', passwordMatch ? 'SÍ' : 'NO');

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Usuario o contraseña incorrectos'
      });
    }

    // Generar JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.usuario,
        role: user.Rol
      },
      process.env.JWT_SECRET || 'chronogest_secret_key_2026',
      { expiresIn: '24h' }
    );

    console.log('4. Token generado:', token.substring(0, 20) + '...');

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.usuario,
        name: user.nombre,
        role: user.Rol,
        email: user.correo
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

// Registro de usuario
exports.register = async (req, res) => {
  try {
    const {
      username,
      password,
      role,
      fullName,
      email,
      phone,
      documentType,
      documentNumber
    } = req.body;

    if (!username || !password || !role || !fullName || !email) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }

    // Verificar si usuario existe (SQLite síncrono)
    const existingUser = db.prepare('SELECT id FROM usuarios WHERE usuario = ? OR correo = ?').get(username, email);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El usuario o email ya existe'
      });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario (SQLite síncrono)
    const insert = db.prepare(`
      INSERT INTO usuarios 
      (usuario, contrasena, Rol, nombre, correo, telefono, tipoDocumento, numeroDocumento) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(username, hashedPassword, role, fullName, email, phone, documentType, documentNumber);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      userId: result.lastInsertRowid
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

// Obtener usuario actual
exports.getMe = async (req, res) => {
  try {
    const user = db.prepare('SELECT id, usuario, nombre, correo, Rol FROM usuarios WHERE id = ?').get(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.usuario,
        name: user.nombre,
        email: user.correo,
        role: user.Rol
      }
    });
  } catch (error) {
    console.error('Error en getMe:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};