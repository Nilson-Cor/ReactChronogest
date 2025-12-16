// backend/controllers/horariosController.js
// COMPATIBLE CON mysql2/promise

const db = require('../config/database');

// ==================== HORARIOS ====================

// Crear nuevo horario
const crearHorario = async (req, res) => {
  try {
    const { diaSemana, horaInicio, horaFin, competencia } = req.body;

    if (!diaSemana || !horaInicio || !horaFin) {
      return res.json({
        success: false,
        message: 'Faltan campos obligatorios'
      });
    }

    const query = `
      INSERT INTO horarios 
      (dia_semana, hora_inicio, hora_fin, competencia, fecha_creacion, estado)
      VALUES (?, ?, ?, ?, CURDATE(), 'Activo')
    `;

    const [result] = await db.query(query, [
      diaSemana,
      horaInicio,
      horaFin,
      competencia || null
    ]);

    res.json({
      success: true,
      message: 'Horario creado exitosamente',
      horarioId: result.insertId
    });

  } catch (error) {
    console.error('Error creando horario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear horario'
    });
  }
};

// Obtener horarios base
const obtenerHorariosBase = async (req, res) => {
  try {
    const query = `
      SELECT id, dia_semana, hora_inicio, hora_fin, competencia, fecha_creacion, estado
      FROM horarios
      WHERE ficha_id IS NULL
        AND instructor_id IS NULL
        AND estado = 'Activo'
      ORDER BY 
        FIELD(dia_semana,'Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'),
        hora_inicio
    `;

    const [horarios] = await db.query(query);

    res.json({ success: true, horarios });

  } catch (error) {
    console.error('Error obteniendo horarios base:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener horarios'
    });
  }
};

// Actualizar horario
const actualizarHorario = async (req, res) => {
  try {
    const { id } = req.params;
    const { diaSemana, horaInicio, horaFin, competencia } = req.body;

    const [result] = await db.query(
      `UPDATE horarios 
       SET dia_semana=?, hora_inicio=?, hora_fin=?, competencia=?
       WHERE id=?`,
      [diaSemana, horaInicio, horaFin, competencia || null, id]
    );

    if (result.affectedRows === 0) {
      return res.json({ success: false, message: 'Horario no encontrado' });
    }

    res.json({ success: true, message: 'Horario actualizado exitosamente' });

  } catch (error) {
    console.error('Error actualizando horario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar horario'
    });
  }
};

// Eliminar horario base (inactivar)
const eliminarHorario = async (req, res) => {
  try {
    const { id } = req.params;

    const [[check]] = await db.query(
      `SELECT COUNT(*) AS count
       FROM horarios
       WHERE id=? AND (ficha_id IS NOT NULL OR instructor_id IS NOT NULL)`,
      [id]
    );

    if (check.count > 0) {
      return res.json({
        success: false,
        message: 'Horario tiene asignaciones activas'
      });
    }

    const [result] = await db.query(
      `UPDATE horarios SET estado='Inactivo' WHERE id=?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.json({ success: false, message: 'Horario no encontrado' });
    }

    res.json({ success: true, message: 'Horario eliminado exitosamente' });

  } catch (error) {
    console.error('Error eliminando horario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar horario'
    });
  }
};

// ==================== ASIGNACIONES ====================

// backend/controllers/horariosController.js
const asignarHorario = async (req, res) => {
  try {
    const { horarioId, tipo, instructorId, fichaId, ambienteId } = req.body;

    // Verificar que el horario base exista
    const [[horario]] = await db.query(
      'SELECT * FROM horarios WHERE id=? AND estado="Activo"',
      [horarioId]
    );

    if (!horario) {
      return res.json({ success: false, message: 'Horario no encontrado' });
    }

    // Validar conflictos de ambiente
    const [[conflicto]] = await db.query(
      `SELECT COUNT(*) AS count
       FROM horarios
       WHERE ambiente_id=? AND dia_semana=? AND estado='Activo'
       AND (
         (hora_inicio < ? AND hora_fin > ?) OR
         (hora_inicio < ? AND hora_fin > ?) OR
         (hora_inicio >= ? AND hora_fin <= ?)
       )`,
      [
        ambienteId,
        horario.dia_semana,
        horario.hora_fin, horario.hora_inicio,
        horario.hora_fin, horario.hora_inicio,
        horario.hora_inicio, horario.hora_fin
      ]
    );

    if (conflicto.count > 0) {
      return res.json({
        success: false,
        message: 'Conflicto de ambiente'
      });
    }

    // Crear asignación
    const [result] = await db.query(
      `INSERT INTO horarios
       (ficha_id, instructor_id, ambiente_id, dia_semana, hora_inicio, hora_fin,
        competencia, fecha_creacion, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), 'Activo')`,
      [
        tipo === 'ficha' ? fichaId : null,
        tipo === 'instructor' ? instructorId : null,
        ambienteId,
        horario.dia_semana,
        horario.hora_inicio,
        horario.hora_fin,
        horario.competencia
      ]
    );

    // Obtener la asignación recién creada con toda la info relacionada
    const [[asignacionCreada]] = await db.query(`
      SELECT 
        h.id,
        h.dia_semana,
        h.hora_inicio,
        h.hora_fin,
        h.competencia,
        CASE 
          WHEN h.instructor_id IS NOT NULL THEN 'instructor'
          WHEN h.ficha_id IS NOT NULL THEN 'ficha'
        END AS tipo,
        i.id AS instructor_id,
        u.nombre AS instructor_nombre,
        f.id AS ficha_id,
        f.numero AS ficha_numero,
        p.nombre AS programa_nombre,
        a.id AS ambiente_id,
        a.nombre AS ambiente_nombre
      FROM horarios h
      LEFT JOIN instructores i ON h.instructor_id = i.id
      LEFT JOIN usuarios u ON i.usuario_id = u.id
      LEFT JOIN fichas f ON h.ficha_id = f.id
      LEFT JOIN programas p ON f.programa_id = p.id
      LEFT JOIN ambientes a ON h.ambiente_id = a.id
      WHERE h.id = ?
    `, [result.insertId]);

    res.json({
      success: true,
      message: 'Horario asignado exitosamente',
      asignacion: asignacionCreada
    });

  } catch (error) {
    console.error('Error asignando horario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al asignar horario'
    });
  }
};


// ==================== LISTADOS AUXILIARES ====================

const obtenerAsignaciones = async (req, res) => {
  try {
    const [asignaciones] = await db.query(`
      SELECT h.*
      FROM horarios h
      WHERE (h.ficha_id IS NOT NULL OR h.instructor_id IS NOT NULL)
        AND h.estado='Activo'
    `);

    res.json({ success: true, asignaciones });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

const obtenerInstructores = async (req, res) => {
  const [instructores] = await db.query(`
    SELECT i.id, u.nombre
    FROM instructores i
    JOIN usuarios u ON i.usuario_id=u.id
    WHERE i.activo=1 AND u.activo=1
  `);
  res.json({ success: true, instructores });
};

const obtenerFichas = async (req, res) => {
  const [fichas] = await db.query(`
    SELECT id, numero FROM fichas WHERE activo=1
  `);
  res.json({ success: true, fichas });
};

const obtenerAmbientes = async (req, res) => {
  const [ambientes] = await db.query(`
    SELECT id, nombre FROM ambientes WHERE activo=1
  `);
  res.json({ success: true, ambientes });
};

module.exports = {
  crearHorario,
  obtenerHorariosBase,
  actualizarHorario,
  eliminarHorario,
  asignarHorario,
  obtenerAsignaciones,
  obtenerInstructores,
  obtenerFichas,
  obtenerAmbientes
};
