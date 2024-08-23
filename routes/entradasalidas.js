const express = require("express");
const router = express.Router();
const db = require("../db"); // Asegúrate de que este archivo esté en la ruta correcta

// Ruta para registrar una nueva entrada/salida
router.post("/", (req, res) => {
  const { idUsuario, HoraEntrada, HoraSalida } = req.body;

  if (!idUsuario || !HoraEntrada) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }

  const insertQuery = `
        INSERT INTO EntradaSalida (idUsuario)
        VALUES (?)
    `;

  const values = [idUsuario, HoraEntrada, HoraSalida || null];

  db.query(insertQuery, values, (err, results) => {
    if (err) {
      console.error("Error al registrar entrada/salida:", err);
      return res
        .status(500)
        .json({ error: "Error al registrar entrada/salida" });
    }

    res
      .status(201)
      .json({
        message: "Registro de entrada/salida exitoso",
        id: results.insertId,
      });
  });
});

router.get("/:date", (req, res) => {
  const { date } = req.params;

  let query = `SELECT u.idUsuario as ID, u.Nombre AS nombre, u.TipoUsuario AS tipo, e.HoraEntrada as hora, e.HoraSalida as HoraSalida, e.idEntradaSalida as idE 
                FROM EntradaSalida as e inner join Usuario as u 
                on u.idUsuario=e.idUsuario 
                where fecha= ? `;

  db.query(query, [date], (err, results) => {
    if (err) {
      console.error("Error al obtener registros de EntradaSalida:", err);
      return res
        .status(500)
        .json({ error: "Error al obtener registros de EntradaSalida" });
    }

    if (results.length > 0) {
      res.status(200).json(results);
    } else {
      res.status(404).json({ message: "No se encontraron registros" });
    }
  });
});

router.put("/:id", (req, res) => {
  const { id } = req.params;

  // Obtener la hora actual en formato HH:MM:SS
  const currentTime = new Date().toTimeString().split(" ")[0]; // Esto toma solo la parte de la hora

  const updateQuery = `
        UPDATE EntradaSalida 
        SET HoraSalida = ? 
        WHERE idEntradaSalida = ? AND HoraSalida IS NULL
    `;

  db.query(updateQuery, [currentTime, id], (err, results) => {
    if (err) {
      console.error("Error al actualizar la hora de salida:", err);
      return res
        .status(500)
        .json({ error: "Error al actualizar la hora de salida" });
    }

    if (results.affectedRows > 0) {
      res
        .status(200)
        .json({ message: "Hora de salida actualizada exitosamente" });
    } else {
      res
        .status(404)
        .json({ message: "Registro no encontrado o ya tiene HoraSalida" });
    }
  });
});

module.exports = router;
