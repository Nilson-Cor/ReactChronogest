const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.getAllUsers = async (req, res) => {
  try {
    // SQLite síncrono - usar prepare().all()
    const users = db.prepare(`
      SELECT id, usuario as username, Rol as role, nombre as fullName, 
              correo as email, telefono as phone, tipoDocumento as documentType, 
              numeroDocumento as documentNumber, activo 
       FROM usuarios 
       WHERE activo = 1 
       ORDER BY id DESC
    `).all();

    const formattedUsers = users.map(user => ({
      id: user.id.toString(),
      username: user.username || '',
      password: '',
      role: user.role || '',
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      documentType: user.documentType || '',
      documentNumber: user.documentNumber ? user.documentNumber.toString() : '',
      createdAt: new Date().toISOString(),
      type: 'registrado'
    }));

    res.json({
      success: true,
      users: formattedUsers
    });

  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // SQLite síncrono - usar prepare().get()
    const user = db.prepare(`
      SELECT id, usuario as username, Rol as role, nombre as fullName, 
              correo as email, telefono as phone, tipoDocumento as documentType, 
              numeroDocumento as documentNumber 
       FROM usuarios 
       WHERE id = ? AND activo = 1
    `).get(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id.toString(),
        username: user.username || '',
        role: user.role || '',
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        documentType: user.documentType || '',
        documentNumber: user.documentNumber ? user.documentNumber.toString() : ''
      }
    });

  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, role } = req.body;

    // SQLite síncrono - usar prepare().run()
    const result = db.prepare(`
        UPDATE usuarios 
        SET nombre = ?, correo = ?, telefono = ?, Rol = ? 
        WHERE id = ?
    `).run(fullName, email, phone, role, id);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // SQLite síncrono - verificar si existe
    const user = db.prepare('SELECT id FROM usuarios WHERE id = ?').get(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // SQLite síncrono - soft delete
    db.prepare('UPDATE usuarios SET activo = 0 WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};