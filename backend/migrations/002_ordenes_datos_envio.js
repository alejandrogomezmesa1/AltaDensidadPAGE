// Columnas de envío de Ordenes. Antes se intentaba con ADD COLUMN IF NOT EXISTS,
// que MySQL 8 no soporta: en bases antiguas fallaba en silencio.
const COLUMNAS = {
    payer_email: 'VARCHAR(255) NULL',
    payer_name: 'VARCHAR(255) NULL',
    envio_nombre: 'VARCHAR(255) NULL',
    envio_documento: 'VARCHAR(100) NULL',
    envio_celular: 'VARCHAR(60) NULL',
    envio_ciudad: 'VARCHAR(150) NULL',
    envio_direccion: 'VARCHAR(300) NULL',
    envio_piso: 'VARCHAR(100) NULL',
    envio_municipio: 'VARCHAR(150) NULL',
    envio_barrio: 'VARCHAR(150) NULL',
    envio_contacto_alt: 'VARCHAR(60) NULL',
    envio_referencia: 'TEXT NULL',
    metadata: 'JSON NULL'
};

module.exports = {
    nombre: 'Datos de envío en Ordenes',
    async up(conn, h) {
        for (const [col, tipo] of Object.entries(COLUMNAS)) {
            if (!(await h.columnaExiste('Ordenes', col))) {
                await conn.query(`ALTER TABLE Ordenes ADD COLUMN ${col} ${tipo}`);
            }
        }
    }
};
