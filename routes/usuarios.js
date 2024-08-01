const express = require('express');
const router = express.Router();
const db = require('../db'); // Asegúrate de que este archivo esté en la ruta correcta

// Ruta para crear un nuevo usuario
router.post('/', (req, res) => {
    const { userType, controlNumber, email, fullName, birthDate, career, groupo } = req.body;
    
    // Validación básica
    if (!userType || !email || !fullName) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Construir la consulta SQL
    const query = `
        INSERT INTO usuarios (userType, controlNumber, email, fullName, birthDate, career, \`groupo\`)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    // Valores a insertar, usando null para los campos opcionales si no están presentes
    const values = [
        userType,
        controlNumber || null,
        email,
        fullName,
        birthDate || null,
        career || null,
        groupo || null
    ];

    // Ejecutar la consulta
    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error al insertar usuario:', err);
            return res.status(500).json({ error: 'Error al registrar usuario' });
        }
        res.status(201).json({ id: results.insertId, ...req.body });
    });
});

module.exports = router;
