const mysql = require('mysql2');
require('dotenv').config(); // Asegúrate de que este módulo esté instalado

// Crear conexión a la base de datos usando variables de entorno
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT, // Asegúrate de especificar el puerto si es necesario
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

connection.connect(error => {
    if (error) {
        console.error('Error de conexión a la base de datos:', error);
        process.exit(1);
    }
    console.log('Conexión exitosa a la base de datos');
});

module.exports = connection;
