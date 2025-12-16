const db = require('../config/database');
const bcrypt = require('bcrypt');

exports.getAllUsers = async (req, res) => {
  try {
    // ASUME QUE EL ROL 'Instructor' ESTÁ ESCRITO EXACTAMENTE ASÍ EN LA BASE DE DATOS
    const [users] = await db.query(
      `SELECT id, usuario as username, Rol as role, nombre as fullName, 
        correo as email, telefono as phone, tipoDocumento as documentType, 
        NumeroDocumento as documentNumber, activo 
       FROM usuarios 
       WHERE activo = 1 AND Rol = 'instructor' 
       ORDER BY id DESC`
    );

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

    const [users] = await db.query(
      `SELECT id, usuario as username, Rol as role, nombre as fullName, 
              correo as email, telefono as phone, tipoDocumento as documentType, 
              NumeroDocumento as documentNumber 
       FROM usuarios 
       WHERE id = ? AND activo = 1`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    const user = users[0];
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

    const [result] = await db.query(
        `UPDATE usuarios 
        SET nombre = ?, correo = ?, telefono = ?, Rol = ? 
        WHERE id = ?`,
        [fullName, email, phone, role, id]
    );

    if (result.affectedRows === 0) {
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

    const [users] = await db.query(
        'SELECT id FROM usuarios WHERE id = ?',
        [id]
    );

    if (users.length === 0) {
        return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
        });
    }

    const [result] = await db.query(
        'UPDATE usuarios SET activo = 0 WHERE id = ?',
        [id]
    );

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