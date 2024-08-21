const express = require('express');
const router = express.Router();
const db = require('../db');  // Ensure you have a database connection module

// Register a new vehicle
router.post('/add', (req, res) => {
  const { idUsuario,TipoVehiculo, Placa, Marca, Modelo, Descripcion } = req.body;
  const query = 'INSERT INTO Vehiculo (idUsuario, TipoVehiculo, Placa, Marca, Modelo, Descripcion) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [idUsuario,TipoVehiculo, Placa, Marca, Modelo, Descripcion], (error, results) => {
    if (error) return res.status(500).json({error});
    res.status(201).json({TipoVehiculo , idUsuario, Placa, Marca, Modelo, Descripcion });
  });
});

// Update a vehicle
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { idUsuario, Placa, Marca, Modelo, Descripcion } = req.body;
  const query = 'UPDATE Vehiculo SET idUsuario = ?, Placa = ?, Marca = ?, Modelo = ?, Descripcion = ? WHERE idVehiculo = ?';
  db.query(query, [idUsuario, Placa, Marca, Modelo, Descripcion, id], (error, results) => {
    if (error) return res.status(500).send(error);
    res.status(200).json({ idVehiculo: id, idUsuario, Placa, Marca, Modelo, Descripcion });
  });
});

// Delete a vehicle
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  const query = 'DELETE FROM Vehiculo WHERE idVehiculo = ?';
  db.query(query, [id], (error, results) => {
    if (error) return res.status(500).send(error);
    res.status(200).json({ message: 'Vehicle deleted' });
  });
});

// Get all vehicles
router.get('/', (req, res) => {
  const query = 'SELECT * FROM Vehiculo';
  db.query(query, (error, results) => {
    if (error) return res.status(500).send(error);
    res.status(200).json(results);
  });
});

// Search for a vehicle by ID
router.get('/:id', (req, res) => {
  const id = req.params.id;
  const query = 'SELECT * FROM Vehiculo WHERE idVehiculo = ?';
  db.query(query, [id], (error, results) => {
    if (error) return res.status(500).send(error);
    res.status(200).json(results[0]);
  });
});

// Ruta para obtener todos los usuarios
router.get('/all', (req, res) => {
  const query = `
      SELECT u.idUsuario, u.Nombre, u.CorreoElectronico, u.TipoUsuario,
             COALESCE(e.controlNumber, p.controlNumber) AS controlNumber,
             COALESCE(e.career, NULL) AS career,
             COALESCE(e.groupo, NULL) AS groupo   
      FROM Usuario u
      LEFT JOIN Estudiante e ON u.idUsuario = e.idUsuario
      LEFT JOIN Profesor p ON u.idUsuario = p.idUsuario
      where u.TipoUsuario = 'Estudiante' or u.TipoUsuario = 'Profesor'
  `;

  db.query(query, (err, results) => {
      if (err) {
          console.error('Error al obtener usuarios:', err);
          return res.status(500).json({ error: 'Error al obtener usuarios' });
      }
      res.status(200).json(results);
  });
});

module.exports = router;
