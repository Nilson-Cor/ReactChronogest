// controllers/authController.js
const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Usuario y contraseña son requeridos' 
      });
    }

    const [users] = await db.query(
      'SELECT * FROM usuarios WHERE usuario = ? AND activo = 1',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario o contraseña incorrectos' 
      });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.contrasena);

    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario o contraseña incorrectos' 
      });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.usuario, 
        role: user.Rol 
      },
      process.env.JWT_SECRET || 'tu_secreto_jwt',
      { expiresIn: '24h' }
    );

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
      message: 'Error en el servidor' 
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

    const [existingUsers] = await db.query(
      'SELECT id FROM usuarios WHERE usuario = ? OR correo = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'El usuario o email ya existe' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO usuarios 
       (usuario, contrasena, Rol, nombre, correo, telefono, tipoDocumento, NumeroDocumento) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [username, hashedPassword, role, fullName, email, phone, documentType, documentNumber]
    );

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      userId: result.insertId
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error en el servidor' 
    });
  }
};