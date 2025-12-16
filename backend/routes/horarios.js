const express = require('express');
const router = express.Router();

const {
    crearHorario,
    obtenerHorariosBase,
    actualizarHorario,
    eliminarHorario,
    asignarHorario,
    obtenerAsignaciones,
    obtenerInstructores,
    obtenerFichas,
    obtenerAmbientes
} = require('../controllers/horariosController');

const { verificarToken } = require('../middleware/auth');

// ================= HORARIOS =================

// Crear
router.post('/', verificarToken, crearHorario);

// Listar base
router.get('/base', verificarToken, obtenerHorariosBase);

// Actualizar
router.put('/:id', verificarToken, actualizarHorario);

router.delete('/:id', verificarToken, eliminarHorario);

// ================= ASIGNACIONES =================

router.post('/asignar', verificarToken, asignarHorario);
router.get('/asignaciones', verificarToken, obtenerAsignaciones);

// ================= LISTADOS =================

router.get('/instructores', verificarToken, obtenerInstructores);
router.get('/fichas', verificarToken, obtenerFichas);
router.get('/ambientes', verificarToken, obtenerAmbientes);

module.exports = router;
