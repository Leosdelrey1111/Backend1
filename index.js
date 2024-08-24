const cors = require('cors');
const express = require('express');
const mysql = require('mysql2'); // Usa mysql2 para mejor compatibilidad
const bodyParser = require('body-parser');
const morgan = require('morgan');
require('dotenv').config(); // Cargar variables de entorno

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// Configuración de conexión a la base de datos
const conexion = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT, // Asegúrate de especificar el puerto si es necesario
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

// Conexión con la base de datos
conexion.connect(error => {
    if (error) {
        console.error('Error conectando a la base de datos:', error.stack);
        return;
    }
    console.log('Conexión exitosa a la BD');
});

// Rutas
const usuarioRoutes = require('./routes/usuarios');
app.use('/usuarios', usuarioRoutes);

const suplierRoutes = require('./routes/suplier');
app.use('/suplier', suplierRoutes);

const vehicleRoutes = require('./routes/vehicleRoutes');
app.use('/vehicleRoutes', vehicleRoutes);

const trabajadoresRoutes = require('./routes/trabajadores');
app.use('/trabajadores', trabajadoresRoutes);

const reportesRoutes = require('./routes/reportes');
app.use('/reportes', reportesRoutes);

const entradas = require('./routes/entradasalidas');
app.use('/entradas-salidas', entradas);

// Ruta raíz
app.get('/', (req, res) => {
    res.send('API');
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});
