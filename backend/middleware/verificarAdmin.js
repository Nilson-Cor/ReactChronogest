function verificarAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acceso solo para administradores'
    });
  }

  next();
}

module.exports = {
  verificarAdmin
};
