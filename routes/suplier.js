const express = require('express');
const router = express.Router();
const db = require('../db'); // Asegúrate de que este archivo esté en la ruta correcta

// Ruta para crear un nuevo usuario, proveedor y vehículo
router.post('/', (req, res) => {
  const { model, plates, companyName, providerName, email, fullName } = req.body;

  if (!fullName || !model || !plates || !companyName || !providerName) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  // Crear un nuevo usuario
  const userQuery = `
    INSERT INTO Usuario (CorreoElectronico, Nombre, Contrasena, TipoUsuario)
    VALUES (?, ?, '', 'Proveedor')
  `;
  const userValues = [email || null, fullName];

  db.query(userQuery, userValues, (err, userResults) => {
    if (err) {
      console.error('Error al insertar usuario:', err);
      return res.status(500).json({ error: 'Error al registrar usuario' });
    }

    const userId = userResults.insertId;

    // Crear el proveedor asociado al usuario
    const providerQuery = `
      INSERT INTO Proveedor (idProveedor, Nombre, RazonSocial)
      VALUES (?, ?, ?)
    `;
    const providerValues = [userId, providerName, companyName];

    db.query(providerQuery, providerValues, (err) => {
      if (err) {
        console.error('Error al insertar proveedor:', err);
        return res.status(500).json({ error: 'Error al registrar proveedor' });
      }

      // Insertar el vehículo en la tabla Vehiculo
      const vehicleQuery = `
        INSERT INTO Vehiculo (idUsuario, Placa, Marca, Modelo)
        VALUES (?, ?, '', ?)
      `;
      const vehicleValues = [userId, plates, model, companyName || null];

      db.query(vehicleQuery, vehicleValues, (err) => {
        if (err) {
          console.error('Error al insertar vehículo:', err);
          return res.status(500).json({ error: 'Error al registrar vehículo' });
        }

        res.status(201).json({ message: 'Proveedor y vehículo registrados con éxito', id: userId });
      });
    });
  });
});

// Ruta para obtener un usuario, proveedor y vehículo por su ID
router.get('/', (req, res) => {
  const userId = req.params.id;

  // Consultar información del usuario
  const userQuery = `
    SELECT p.Nombre AS ProveedorNombre, p.RazonSocial, v.Placa, v.Modelo
    FROM Usuario u
    LEFT JOIN Proveedor p ON u.idUsuario = p.idProveedor
    LEFT JOIN Vehiculo v ON u.idUsuario = v.idUsuario
  `;

  db.query(userQuery, [userId], (err, results) => {
    if (err) {
      console.error('Error al obtener la información:', err);
      return res.status(500).json({ error: 'Error al obtener la información' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'No se encontró el usuario' });
    }

    res.status(200).json(results[0]);
  });
});

module.exports = router;
