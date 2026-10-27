// Marketplace y vigía de tendencias:
// - MarketplacePublicaciones: qué perfume está publicado en Facebook Marketplace, desde cuándo y cuántas
//   veces se ha renovado (el panel avisa cuándo renovar y cuándo bajar una publicación agotada).
// - MarketplaceTextos: el texto de cada publicación cuando se edita en el panel (sin fila = texto base).
// - MarketplaceAjustes: pie común de las descripciones y cuántas publicaciones nuevas proponer por día.
// - TendenciasInformes: cada investigación del mercado (búsquedas en Colombia, noticias y comunidad),
//   con el puntaje por perfume, el Top 10 sugerido y el resumen.
module.exports = {
    nombre: 'Marketplace: publicaciones, textos y vigía de tendencias',
    async up(conn) {
        await conn.query(`CREATE TABLE IF NOT EXISTS MarketplacePublicaciones (
            producto_id INT PRIMARY KEY,
            estado ENUM('publicada','pausada') NOT NULL DEFAULT 'publicada',
            publicada_en DATETIME NOT NULL,
            renovada_en DATETIME NULL,
            veces INT NOT NULL DEFAULT 1,
            enlace VARCHAR(500) NULL,
            actualizado_por VARCHAR(100) NULL,
            actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT fk_mp_publicaciones_producto FOREIGN KEY (producto_id) REFERENCES Productos(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
        await conn.query(`CREATE TABLE IF NOT EXISTS MarketplaceTextos (
            producto_id INT PRIMARY KEY,
            nombre VARCHAR(80) NOT NULL,
            gancho VARCHAR(160) NOT NULL,
            sensacion VARCHAR(200) NOT NULL,
            ideal VARCHAR(160) NOT NULL,
            actualizado_por VARCHAR(100) NULL,
            actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT fk_mp_textos_producto FOREIGN KEY (producto_id) REFERENCES Productos(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
        await conn.query(`CREATE TABLE IF NOT EXISTS MarketplaceAjustes (
            clave VARCHAR(40) PRIMARY KEY,
            valor TEXT NOT NULL,
            actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
        await conn.query(`CREATE TABLE IF NOT EXISTS TendenciasInformes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            generado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            origen ENUM('automatico','manual') NOT NULL,
            datos MEDIUMTEXT NOT NULL,
            resumen TEXT NULL,
            resumen_origen VARCHAR(20) NULL,
            INDEX idx_tendencias_fecha (generado_en)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    }
};
