const cors = require('cors');
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configuración de CORS
const corsOptions = {
    origin: 'https://esatcionamiento.netlify.app/', // Reemplaza con la URL de tu sitio en Netlify
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(morgan('dev'));

// Configuración de conexión a la base de datos
const conexion = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
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
