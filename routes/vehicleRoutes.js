const express = require('express');
const router = express.Router();
const db = require('../db');  // Asegúrate de tener un módulo de conexión a la base de datos

// Registrar un nuevo vehículo
router.post('/add', (req, res) => {
  const { idUsuario, vehicleType, brand, model, licensePlate, color, description, registrationDate } = req.body;
  const query = 'INSERT INTO Vehiculo (idUsuario, vehicleType, brand, model, licensePlate, color, description, registrationDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [idUsuario, vehicleType, brand, model, licensePlate, color, description, registrationDate], (error, results) => {
    if (error) return res.status(500).send(error);
    res.status(201).json({ idVehiculo: results.insertId, ...req.body });
  });
});

// Actualizar un vehículo
router.put('/unadd', (req, res) => {
  const id = req.params.id;
  const { idUsuario, vehicleType, brand, model, licensePlate, color, description, registrationDate } = req.body;
  const query = 'UPDATE Vehiculo SET idUsuario = ?, vehicleType = ?, brand = ?, model = ?, licensePlate = ?, color = ?, description = ?, registrationDate = ? WHERE idVehiculo = ?';
  db.query(query, [idUsuario, vehicleType, brand, model, licensePlate, color, description, registrationDate, id], (error, results) => {
    if (error) return res.status(500).send(error);
    res.status(200).json({ idVehiculo: id, ...req.body });
  });
});

// Eliminar un vehículo
router.delete('/delete/:id', (req, res) => {
  const id = req.params.id;
  const query = 'DELETE FROM Vehiculo WHERE idVehiculo = ?';
  db.query(query, [id], (error, results) => {
    if (error) return res.status(500).send(error);
    res.status(200).json({ message: 'Vehículo eliminado' });
  });
});

// Obtener todos los vehículos
router.get('/', (req, res) => {
  const query = 'SELECT * FROM Vehiculo';
  db.query(query, (error, results) => {
    if (error) return res.status(500).send(error);
    res.status(200).json(results);
  });
});

// Buscar un vehículo por ID
router.post('/search', (req, res) => {
  const { id } = req.body;
  const query = 'SELECT * FROM Vehiculo WHERE idVehiculo = ?';
  db.query(query, [id], (error, results) => {
    if (error) return res.status(500).send(error);
    res.status(200).json(results);
  });
});

module.exports = router;
