const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

let pool = null;

async function getConnection() {
    if (pool) return pool;
    pool = await mysql.createPool({
        host:     process.env.DB_HOST     || 'localhost',
        port:     parseInt(process.env.DB_PORT) || 3306,
        database: process.env.DB_DATABASE,
        user:     process.env.DB_USER     || 'root',
        password: process.env.DB_PASSWORD || '',
        waitForConnections: true,
        connectionLimit:    10,
        queueLimit:         0
    });
    console.log('Conexion a MySQL (XAMPP) establecida correctamente');
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
