const express = require('express');
const router = express.Router();
const db = require('../db'); // Asegúrate de que este archivo esté en la ruta correcta

// Ruta para crear un nuevo usuario
router.post('/', (req, res) => {
    const { userType, controlNumber, email, fullName, career, groupo } = req.body;
    
    if (!userType || !email || !fullName) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const userQuery = `
        INSERT INTO Usuario (Nombre, CorreoElectronico, Contrasena, TipoUsuario)
        VALUES (?, ?, ?, ?)
    `;
    
    const userValues = [fullName, email, null, userType];

    db.query(userQuery, userValues, (err, results) => {
        if (err) {
            console.error('Error al insertar usuario:', err);
            return res.status(500).json({ error: 'Error al registrar usuario' });
        }

        const userId = results.insertId;
        
        if (userType === 'Estudiante') {
            const studentQuery = `
                INSERT INTO Estudiante (idUsuario, Nombre, controlNumber, career, groupo)
                VALUES (?, ?, ?, ?, ?)
            `;
            
            const studentValues = [userId, fullName, controlNumber, career || null, groupo || null];
            
            db.query(studentQuery, studentValues, (err) => {
                if (err) {
                    console.error('Error al insertar estudiante:', err);
                    return res.status(500).json({ error: 'Error al registrar estudiante' });
                }
                res.status(201).json({ id: userId, ...req.body });
            });
        } else if (userType === 'Profesor') {
            const professorQuery = `
                INSERT INTO Profesor (idUsuario, Nombre, controlNumber)
                VALUES (?, ?, ?)
            `;
            
            const professorValues = [userId, fullName, controlNumber];
            
            db.query(professorQuery, professorValues, (err) => {
                if (err) {
                    console.error('Error al insertar profesor:', err);
                    return res.status(500).json({ error: 'Error al registrar profesor' });
                }
                res.status(201).json({ id: userId, ...req.body });
            });
        } else {
            res.status(201).json({ id: userId, ...req.body });
        }
    });
});

// Ruta para actualizar un usuario
router.put('/:id', (req, res) => {
    const userId = req.params.id;
    const { userType, controlNumber, email, fullName, career, groupo } = req.body;

    if (!email || !fullName) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const userQuery = `
        UPDATE Usuario
        SET Nombre = ?, CorreoElectronico = ?, TipoUsuario = ?
        WHERE idUsuario = ?
    `;
    
    const userValues = [fullName, email, userType, userId];

    db.query(userQuery, userValues, (err) => {
        if (err) {
            console.error('Error al actualizar usuario:', err);
            return res.status(500).json({ error: 'Error al actualizar usuario' });
        }

        if (userType === 'Estudiante') {
            const studentQuery = `
                INSERT INTO Estudiante (idUsuario, Nombre, controlNumber, career, groupo)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE Nombre = VALUES(Nombre), controlNumber = VALUES(controlNumber), career = VALUES(career), groupo = VALUES(groupo)
            `;
            
            const studentValues = [userId, fullName, controlNumber, career || null, groupo || null];
            
            db.query(studentQuery, studentValues, (err) => {
                if (err) {
                    console.error('Error al actualizar estudiante:', err);
                    return res.status(500).json({ error: 'Error al actualizar estudiante' });
                }
                res.status(200).json({ id: userId, ...req.body });
            });
        } else if (userType === 'Profesor') {
            const professorQuery = `
                INSERT INTO Profesor (idUsuario, Nombre, controlNumber)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE Nombre = VALUES(Nombre), controlNumber = VALUES(controlNumber)
            `;
            
            const professorValues = [userId, fullName, controlNumber];
            
            db.query(professorQuery, professorValues, (err) => {
                if (err) {
                    console.error('Error al actualizar profesor:', err);
                    return res.status(500).json({ error: 'Error al actualizar profesor' });
                }
                res.status(200).json({ id: userId, ...req.body });
            });
        } else {
            res.status(200).json({ id: userId, ...req.body });
        }
    });
});

// Ruta para eliminar un usuario
router.delete('/:id', (req, res) => {
    const userId = req.params.id;

    // Eliminar de las tablas específicas si existen
    const deleteStudentQuery = 'DELETE FROM Estudiante WHERE idUsuario = ?';
    const deleteProfessorQuery = 'DELETE FROM Profesor WHERE idUsuario = ?';
    const deleteUserQuery = 'DELETE FROM Usuario WHERE idUsuario = ?';

    db.query(deleteStudentQuery, [userId], (err) => {
        if (err) {
            console.error('Error al eliminar estudiante:', err);
            return res.status(500).json({ error: 'Error al eliminar estudiante' });
        }

        db.query(deleteProfessorQuery, [userId], (err) => {
            if (err) {
                console.error('Error al eliminar profesor:', err);
                return res.status(500).json({ error: 'Error al eliminar profesor' });
            }

            db.query(deleteUserQuery, [userId], (err) => {
                if (err) {
                    console.error('Error al eliminar usuario:', err);
                    return res.status(500).json({ error: 'Error al eliminar usuario' });
                }
                res.status(200).json({ message: 'Usuario eliminado exitosamente' });
            });
        });
    });
});

// Ruta para buscar usuarios por ID o nombre
router.get('/search', (req, res) => {
    const { id, name } = req.query;

    let searchQuery = `
       SELECT u.idUsuario, u.Nombre, u.CorreoElectronico, u.TipoUsuario,
               COALESCE(e.controlNumber, p.controlNumber) AS controlNumber,
               COALESCE(e.career, NULL) AS career,
               COALESCE(e.groupo, NULL) AS groupo   
        FROM Usuario u
        LEFT JOIN Estudiante e ON u.idUsuario = e.idUsuario
        LEFT JOIN Profesor p ON u.idUsuario = p.idUsuario
    `;
    const queryParams = [];

    if (id) {
        searchQuery += ' WHERE u.idUsuario = ?';
        queryParams.push(id);
    } else if (name) {
        searchQuery += ' WHERE u.Nombre LIKE ?';
        queryParams.push(`%${name}%`);
    }

    db.query(searchQuery, queryParams, (err, results) => {
        if (err) {
            console.error('Error al buscar usuarios:', err);
            return res.status(500).json({ error: 'Error al buscar usuarios' });
        }
        res.status(200).json(results);
    });
});



module.exports = router;
