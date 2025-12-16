// Dentro de routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verificarToken } = require('../middleware/auth');
const { verificarAdmin } = require('../middleware/verificarAdmin');

// Aplica el middleware a todas las rutas de este archivo
router.use(verificarToken);
router.use(verificarAdmin);

// RUTA NUEVA: Obtener solo instructores (Generalmente el frontend llama a esta)
router.get('/instructors', userController.getInstructors); // <--- DEBES AGREGAR ESTO

// Rutas de administración de usuarios que ya tenías
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;