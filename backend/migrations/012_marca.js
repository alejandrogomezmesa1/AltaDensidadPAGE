// Pestaña Marca del panel: el estado de revisión de cada pieza del brand book y su hilo de notas.
// Las piezas en sí son archivos (public/assets/branding/manifest.json); aquí solo se guarda lo que
// el equipo decide sobre ellas. `pieza` es la ruta de la pieza («01_logo/03-imagotipo.svg»).
module.exports = {
    nombre: 'Marca: revisión y notas de las piezas',
    async up(conn) {
        await conn.query(`CREATE TABLE IF NOT EXISTS MarcaPiezas (
            pieza VARCHAR(160) NOT NULL PRIMARY KEY,
            estado VARCHAR(20) NOT NULL DEFAULT 'propuesta',
            favorita TINYINT(1) NOT NULL DEFAULT 0,
            actualizado_por VARCHAR(100) NULL,
            actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
        // tipo: nota (comentario), cambio (pedido de cambio: queda pendiente hasta resolverlo) o
        // estado (registro automático cuando cambia el estado de la pieza)
        await conn.query(`CREATE TABLE IF NOT EXISTS MarcaNotas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            pieza VARCHAR(160) NOT NULL,
            tipo VARCHAR(10) NOT NULL DEFAULT 'nota',
            texto TEXT NOT NULL,
            resuelta TINYINT(1) NOT NULL DEFAULT 0,
            usuario_id INT NULL,
            autor VARCHAR(100) NULL,
            fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_marca_notas_pieza (pieza),
            INDEX idx_marca_notas_fecha (fecha)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    }
};
