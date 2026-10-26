// Personalizables de la marca: versiones guardadas de las piezas que cambian por persona o por
// producto (firma de correo, etiqueta posterior, etiqueta de decant, tarjeta de agradecimiento y QR).
// `datos` es el JSON con los campos del formulario; el arte se dibuja en el panel a partir de él.
module.exports = {
    nombre: 'Marca: plantillas personalizables',
    async up(conn) {
        await conn.query(`CREATE TABLE IF NOT EXISTS MarcaPlantillas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            tipo VARCHAR(30) NOT NULL,
            nombre VARCHAR(120) NOT NULL,
            datos TEXT NOT NULL,
            creado_por VARCHAR(100) NULL,
            actualizado_por VARCHAR(100) NULL,
            creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_marca_plantillas_tipo (tipo)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    }
};
