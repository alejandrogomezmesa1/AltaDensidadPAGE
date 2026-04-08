// Script para crear el superusuario administrador
// Ejecutar: node seed-admin.js

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const bcrypt = require('bcryptjs');
const { getConnection, closeConnection } = require('./config/db');

const ADMIN = {
    nombre: 'Administrador',
    email:  process.env.ADMIN_EMAIL  || 'admin@altadensidad.com',
    password: process.env.ADMIN_PASSWORD || 'CambiaMeAntesDeEjecutar'
};

async function crearAdmin() {
    try {
        const pool = await getConnection();

        const [existe] = await pool.query('SELECT id, rol FROM Usuarios WHERE email = ?', [ADMIN.email]);

        if (existe.length > 0) {
            const u = existe[0];
            if (u.rol === 'admin') {
                console.log(`âœ” El admin ya existe (id: ${u.id}). No se creÃ³ uno nuevo.`);
            } else {
                await pool.query("UPDATE Usuarios SET rol = 'admin' WHERE email = ?", [ADMIN.email]);
                console.log(`âœ” Usuario existente promovido a admin (id: ${u.id}).`);
            }
            await closeConnection();
            return;
        }

        const password_hash = await bcrypt.hash(ADMIN.password, 10);
        const [result] = await pool.query(
            "INSERT INTO Usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, 'admin')",
            [ADMIN.nombre, ADMIN.email, password_hash]
        );

        const [rows] = await pool.query('SELECT id, nombre, email, rol FROM Usuarios WHERE id = ?', [result.insertId]);
        const admin = rows[0];
        console.log('âœ” Superusuario creado correctamente:');
        console.log(`  ID:     ${admin.id}`);
        console.log(`  Nombre: ${admin.nombre}`);
        console.log(`  Email:  ${admin.email}`);
        console.log(`  Rol:    ${admin.rol}`);
        console.log('');
        console.log('  Credenciales de acceso:');
        console.log(`  Email:    ${ADMIN.email}`);
        console.log(`  Password: ${ADMIN.password}`);

        await closeConnection();
    } catch (err) {
        console.error('Error al crear admin:', err.message);
        process.exit(1);
    }
}

crearAdmin();
