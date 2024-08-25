const express = require('express');
const router = express.Router();
const db = require('../db'); // Asegúrate de que este archivo esté en la ruta correcta

// Ruta para crear un nuevo usuario
router.post('/', (req, res) => {
    const { userType, controlNumber, email, fullName, career, groupo } = req.body;
    
    if (!userType || !email || !fullName) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const barCode = generateBarcodeValue(10);

    const userQuery = `
        INSERT INTO Usuario (Nombre, CorreoElectronico, Contrasena, TipoUsuario, codigo)
        VALUES (?, ?, ?, ?, ?)
    `;
    
    const userValues = [fullName, email, null, userType, barCode];

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
                res.status(201).json({ message: 'Estudiante registrado con éxito', id: userId });
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
                res.status(201).json({ message: 'Profesor registrado con éxito', id: userId });
            });
        } else {
            res.status(201).json({ message: 'Usuario registrado con éxito', id: userId });
        }
    });
});

// Ruta para cambiar la contraseña
router.put('/change-password', (req, res) => {
    const { email, oldPassword, newPassword } = req.body;
    
    if (!email || !oldPassword || !newPassword) {
        console.log(req.body)
        return res.status(400).json({ error: 'Faltan campos requeridos', body: req.body });
    }

    // Verifica el usuario y la contraseña actual
    const verifyUserQuery = `
        SELECT * FROM Usuario
        WHERE CorreoElectronico = ? AND Contrasena = ?
    `;

    db.query(verifyUserQuery, [email, oldPassword], (err, results) => {
        if (err) {
            console.error('Error al verificar usuario:', err);
            return res.status(500).json({ error: 'Error al verificar usuario' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Correo electrónico o contraseña actual incorrectos' });
        }

        // Actualiza la contraseña
        const updatePasswordQuery = `
            UPDATE Usuario
            SET Contrasena = ?
            WHERE CorreoElectronico = ?
        `;

        db.query(updatePasswordQuery, [newPassword, email], (err) => {
            if (err) {
                console.error('Error al actualizar contraseña:', err);
                return res.status(500).json({ error: 'Error al actualizar contraseña' });
            }

            res.status(200).json({ message: 'Contraseña actualizada con éxito' });
        });
    });
});

// Ruta para actualizar un usuario
router.put('/:id', (req, res) => {
    const userId = req.params.id;
    const { userType, controlNumber, email, fullName, career, groupo } = req.body;

    if (!email || !fullName) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Actualizar la tabla Usuario
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

        // Verificar si el usuario es Estudiante o Profesor
        if (userType === 'Estudiante') {
            const checkStudentQuery = `SELECT * FROM Estudiante WHERE idUsuario = ?`;
            db.query(checkStudentQuery, [userId], (err, results) => {
                if (err) {
                    console.error('Error al verificar estudiante:', err);
                    return res.status(500).json({ error: 'Error al verificar estudiante' });
                }

                const studentQuery = results.length > 0
                    ? `UPDATE Estudiante SET Nombre = ?, controlNumber = ?, career = ?, groupo = ? WHERE idUsuario = ?`
                    : `INSERT INTO Estudiante (idUsuario, Nombre, controlNumber, career, groupo) VALUES (?, ?, ?, ?, ?)`;

                const studentValues = [fullName, controlNumber, career || null, groupo || null, userId];

                db.query(studentQuery, studentValues, (err) => {
                    if (err) {
                        console.error('Error al actualizar estudiante:', err);
                        return res.status(500).json({ error: 'Error al actualizar estudiante' });
                    }
                    res.status(200).json({ message: 'Estudiante actualizado con éxito', id: userId });
                });
            });
        } else if (userType === 'Profesor') {
            const checkProfessorQuery = `SELECT * FROM Profesor WHERE idUsuario = ?`;
            db.query(checkProfessorQuery, [userId], (err, results) => {
                if (err) {
                    console.error('Error al verificar profesor:', err);
                    return res.status(500).json({ error: 'Error al verificar profesor' });
                }

                const professorQuery = results.length > 0
                    ? `UPDATE Profesor SET Nombre = ?, controlNumber = ? WHERE idUsuario = ?`
                    : `INSERT INTO Profesor (idUsuario, Nombre, controlNumber) VALUES (?, ?, ?)`;

                const professorValues = [fullName, controlNumber, userId];

                db.query(professorQuery, professorValues, (err) => {
                    if (err) {
                        console.error('Error al actualizar profesor:', err);
                        return res.status(500).json({ error: 'Error al actualizar profesor' });
                    }
                    res.status(200).json({ message: 'Profesor actualizado con éxito', id: userId });
                });
            });
        } else {
            res.status(200).json({ message: 'Usuario actualizado con éxito', id: userId });
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
        WHERE u.TipoUsuario = 'Estudiante' OR u.TipoUsuario = 'Profesor'
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener usuarios:', err);
            return res.status(500).json({ error: 'Error al obtener usuarios' });
        }
        res.status(200).json(results);
    });
});

// Ruta para buscar un usuario por ID
router.get('/:id', (req, res) => {
    const userId = req.params.id;

    const query = `
        SELECT u.idUsuario, u.Nombre, u.CorreoElectronico, u.TipoUsuario,
               COALESCE(e.controlNumber, p.controlNumber) AS controlNumber,
               COALESCE(e.career, NULL) AS career,
               COALESCE(e.groupo, NULL) AS groupo   
        FROM Usuario u
        LEFT JOIN Estudiante e ON u.idUsuario = e.idUsuario
        LEFT JOIN Profesor p ON u.idUsuario = p.idUsuario
        WHERE u.idUsuario = ?
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error al buscar usuario:', err);
            return res.status(500).json({ error: 'Error al buscar usuario' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.status(200).json(results[0]);
    });
});

function generateBarcodeValue(length) {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let barcode = '';
    for (let i = 0; i < length; i++) {
        barcode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return barcode;
}

module.exports = router;
