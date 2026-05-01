const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

let pool = null;

async function getConnection() {
    if (pool) return pool;
    const dbConfig = {
        host:     process.env.DB_HOST     || process.env.MYSQLHOST || 'localhost',
        port:     parseInt(process.env.DB_PORT || process.env.MYSQLPORT || '3306'),
        database: process.env.DB_DATABASE || process.env.MYSQLDATABASE,
        user:     process.env.DB_USER     || process.env.MYSQLUSER || 'root',
        password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
        charset:  'utf8mb4',
        waitForConnections: true,
        connectionLimit:    10,
        queueLimit:         0,
        connectTimeout:     10000 // 10 segundos de timeout
    };

    try {
        pool = await mysql.createPool(dbConfig);
        console.log('Conexión al grupo de bases de datos establecida correctamente');
    } catch (err) {
        console.error('Error CRÍTICO al crear el pool de MySQL:', err.message);
        throw err;
    }
    return pool;
}

async function closeConnection() {
    if (pool) {
        await pool.end();
        pool = null;
        console.log('Conexion a MySQL cerrada');
    }
}

module.exports = { getConnection, closeConnection };
