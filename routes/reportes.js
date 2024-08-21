
const express = require('express');
const router = express.Router();
const db = require('../db');

// Ruta para generar el reporte
router.post('/', (req, res) => {
    const { fecha, totalVehiculos, ingresosTotales, tiempoPromedio, eventosImportantes, observaciones } = req.body;

    const sql = `
        INSERT INTO Reporte (idUsuario, Fecha, Contenido)
        VALUES (?, ?, ?)`;

    const contenido = `
        Total de Vehículos: ${totalVehiculos}\n
        Ingresos Totales: ${ingresosTotales}\n
        Tiempo Promedio de Estacionamiento: ${tiempoPromedio}\n
        Eventos Importantes: ${eventosImportantes}\n
        Observaciones: ${observaciones}
    `;

    db.query(sql, [1, fecha, contenido], (err, result) => { // Aquí '1' es un idUsuario de ejemplo
        if (err) {
            console.error('Error al guardar el reporte:', err);
            return res.status(500).send('Error al guardar el reporte');
        }
        res.send('Reporte guardado exitosamente');
    });
});

module.exports = router;


router.get('/exportar/pdf/:id', (req, res) => {
  const reporteId = req.params.id;
  
  // Aquí generarías el PDF basado en el reporteId
  // Suponiendo que tienes un método que devuelve el PDF
  const pdfBuffer = generatePDF(reporteId); // Implementa la lógica de esta función
  
  res.setHeader('Content-Type', 'application/pdf');
  res.send(pdfBuffer);
});



module.exports = router;
