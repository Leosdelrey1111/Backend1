const express = require('express');
const router = express.Router();
const db = require('../db'); // Asegúrate de que este archivo esté en la ruta correcta

// Ruta para crear un nuevo usuario
router.post('/', (req, res) => {
    const { userType, controlNumber, email, fullName, career, groupo } = req.body;
    
    // Validación básica
    if (!userType || !email || !fullName) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Construir la consulta SQL para insertar en la tabla Usuario
    const userQuery = `
        INSERT INTO Usuario (Nombre, CorreoElectronico, Contrasena, TipoUsuario)
        VALUES (?, ?, ?, ?)
    `;
    
    // Valores a insertar en la tabla Usuario
    const userValues = [
        fullName,
        email,
        null, // La contraseña puede ser opcional si no se usa para Estudiantes y Profesores
        userType
    ];

    // Ejecutar la consulta para insertar en Usuario
    db.query(userQuery, userValues, (err, results) => {
        if (err) {
            console.error('Error al insertar usuario:', err);
            return res.status(500).json({ error: 'Error al registrar usuario' });
        }

        const userId = results.insertId;
        
        // Dependiendo del tipo de usuario, insertar en la tabla correspondiente
        if (userType === 'Estudiante') {
            const studentQuery = `
                INSERT INTO Estudiante (idUsuario, Nombre, controlNumber, career, groupo)
                VALUES (?, ?, ?, ?, ?)
            `;
            
            const studentValues = [
                userId,
                fullName,
                controlNumber,
                career || null,
                groupo || null,
            ];
            
            db.query(studentQuery, studentValues, (err) => {
                if (err) {
                    console.error('Error al insertar estudiante:', err);
                    return res.status(500).json({ error: 'Error al registrar estudiante' });
                }
                res.status(201).json({ id: userId, ...req.body });
            });
        } else if (userType === 'Profesor') {
            const professorQuery = `
                INSERT INTO Profesor (idUsuario, Nombre , controlNumber)
                VALUES (?, ?, ?)
            `;
            
            const professorValues = [
                userId,
                fullName,
                controlNumber
            ];
            
            db.query(professorQuery, professorValues, (err) => {
                if (err) {
                    console.error('Error al insertar profesor:', err);
                    return res.status(500).json({ error: 'Error al registrar profesor' });
                }
                res.status(201).json({ id: userId, ...req.body });
            });
        } else {
            // Si el tipo de usuario no es 'Estudiante' ni 'Profesor', no hacer nada más
            res.status(201).json({ id: userId, ...req.body });
        }
    });
});

module.exports = router;
