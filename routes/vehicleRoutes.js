const express = require('express');
const router = express.Router();
const db = require('../db'); // Asegúrate de que este archivo esté en la ruta correcta

// Ruta para crear un nuevo vehículo
router.post('/', (req, res) => {
    const { vehicleType, brand, model, licensePlate, color, description, registrationDate } = req.body;
    
    if (!vehicleType || !registrationDate) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const vehicleQuery = `
        INSERT INTO Vehicle (vehicleType, brand, model, licensePlate, color, description, registrationDate)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const vehicleValues = [vehicleType, brand, model, licensePlate, color, description || null, registrationDate];

    db.query(vehicleQuery, vehicleValues, (err, results) => {
        if (err) {
            console.error('Error al insertar vehículo:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.status(201).json({ id: results.insertId, ...req.body });
    });
});

// Ruta para actualizar un vehículo
router.put('/:id', (req, res) => {
    const id = req.params.id;
    const { vehicleType, brand, model, licensePlate, color, description, registrationDate } = req.body;

    const vehicleQuery = `
        UPDATE Vehicle
        SET vehicleType = ?, brand = ?, model = ?, licensePlate = ?, color = ?, description = ?, registrationDate = ?
        WHERE id = ?
    `;
    
    const vehicleValues = [vehicleType, brand, model, licensePlate, color, description || null, registrationDate, id];

    db.query(vehicleQuery, vehicleValues, (err, results) => {
        if (err) {
            console.error('Error al actualizar vehículo:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json({ message: 'Vehículo actualizado', id });
    });
});

// Ruta para eliminar un vehículo
router.delete('/:id', (req, res) => {
    const id = req.params.id;

    const vehicleQuery = 'DELETE FROM Vehicle WHERE id = ?';

    db.query(vehicleQuery, [id], (err, results) => {
        if (err) {
            console.error('Error al eliminar vehículo:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json({ message: 'Vehículo eliminado', id });
    });
});

// Ruta para obtener todos los vehículos
router.get('/', (req, res) => {
    db.query('SELECT * FROM Vehicle', (err, results) => {
        if (err) {
            console.error('Error al obtener vehículos:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json(results);
    });
});

// Ruta para buscar un vehículo por ID
router.get('/search', (req, res) => {
    const id = req.query.id;
    if (!id) {
        return res.status(400).json({ error: 'Falta ID de vehículo' });
    }
    
    const vehicleQuery = 'SELECT * FROM Vehicle WHERE id = ?';

    db.query(vehicleQuery, [id], (err, results) => {
        if (err) {
            console.error('Error al buscar vehículo:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json(results);
    });
});

module.exports = router;
