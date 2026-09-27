// Esquema base de la tienda web, con la forma que tienen hoy las tablas en producción.
// En una base existente no cambia nada: todo usa IF NOT EXISTS.
// Sin datos iniciales: las semillas viven en los scripts seed-*.js (cargar datos aquí
// fue lo que duplicó los envases 4 veces).

const TABLAS = [
    `CREATE TABLE IF NOT EXISTS Productos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(200) NOT NULL,
        rating INT NOT NULL DEFAULT 4,
        imagen VARCHAR(300) NOT NULL DEFAULT '',
        categoria VARCHAR(100) NOT NULL,
        genero VARCHAR(50) NOT NULL,
        descripcion TEXT NOT NULL,
        precio DECIMAL(10,2) NOT NULL DEFAULT 0,
        activo TINYINT(1) NOT NULL DEFAULT 1,
        creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CHECK (rating BETWEEN 1 AND 5)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS ProductoTallas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        producto_id INT NOT NULL,
        talla VARCHAR(20) NOT NULL,
        FOREIGN KEY (producto_id) REFERENCES Productos(id) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS ProductoTiposEnvase (
        id INT AUTO_INCREMENT PRIMARY KEY,
        producto_id INT NOT NULL,
        tipo_envase VARCHAR(100) NOT NULL,
        FOREIGN KEY (producto_id) REFERENCES Productos(id) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS Envases (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(200) NOT NULL,
        imagen VARCHAR(300) NOT NULL DEFAULT '',
        material VARCHAR(100) NOT NULL DEFAULT 'Vidrio',
        descripcion TEXT NOT NULL,
        precio DECIMAL(10,2) NOT NULL DEFAULT 0,
        activo TINYINT(1) NOT NULL DEFAULT 1,
        creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS EnvaseTallas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        envase_id INT NOT NULL,
        talla VARCHAR(20) NOT NULL,
        FOREIGN KEY (envase_id) REFERENCES Envases(id) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS Usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(200) NOT NULL UNIQUE,
        password_hash VARCHAR(300) NOT NULL,
        rol VARCHAR(20) NOT NULL DEFAULT 'cliente',
        activo TINYINT(1) NOT NULL DEFAULT 1,
        estado_induccion VARCHAR(30) NOT NULL DEFAULT 'pendiente_capacitacion',
        intentos_examen INT NOT NULL DEFAULT 0,
        ultimo_puntaje INT NOT NULL DEFAULT 0,
        autorizado_por INT NULL,
        fecha_autorizacion DATETIME NULL,
        creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        reset_token VARCHAR(255) NULL,
        reset_token_expires DATETIME NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS CapacitacionItems (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(200) NOT NULL,
        contenido TEXT NOT NULL,
        orden INT NOT NULL DEFAULT 1,
        activo TINYINT(1) NOT NULL DEFAULT 1,
        creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS CapacitacionPreguntas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        item_id INT NULL,
        pregunta TEXT NOT NULL,
        opciones JSON NOT NULL,
        respuesta_correcta INT NOT NULL,
        explicacion TEXT NULL,
        orden INT NOT NULL DEFAULT 1,
        FOREIGN KEY (item_id) REFERENCES CapacitacionItems(id) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS UsuarioProgresoInduccion (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        item_id INT NOT NULL,
        completado TINYINT(1) NOT NULL DEFAULT 1,
        fecha_completado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_usuario_item (usuario_id, item_id),
        FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (item_id) REFERENCES CapacitacionItems(id) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS Kits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(200) NOT NULL,
        imagen VARCHAR(300) NOT NULL DEFAULT '',
        descripcion TEXT NOT NULL,
        precio DECIMAL(10,2) NOT NULL DEFAULT 0,
        activo TINYINT(1) NOT NULL DEFAULT 1,
        creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS KitBeneficios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        kit_id INT NOT NULL,
        beneficio VARCHAR(255) NOT NULL,
        FOREIGN KEY (kit_id) REFERENCES Kits(id) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS Top10 (
        id INT AUTO_INCREMENT PRIMARY KEY,
        producto_id INT NOT NULL,
        posicion INT NOT NULL,
        creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (producto_id) REFERENCES Productos(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS Ordenes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        external_reference VARCHAR(100) UNIQUE,
        items JSON,
        total DECIMAL(10,2) DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'COP',
        status ENUM('pending','approved','cancelled','failed','refunded') DEFAULT 'pending',
        preference_id VARCHAR(100),
        payment_id VARCHAR(100),
        payer_email VARCHAR(255),
        payer_name VARCHAR(255),
        envio_nombre VARCHAR(255),
        envio_documento VARCHAR(100),
        envio_celular VARCHAR(60),
        envio_ciudad VARCHAR(150),
        envio_direccion VARCHAR(300),
        envio_piso VARCHAR(100),
        envio_municipio VARCHAR(150),
        envio_barrio VARCHAR(150),
        envio_contacto_alt VARCHAR(60),
        envio_referencia TEXT,
        metadata JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
];

module.exports = {
    nombre: 'Esquema base',
    async up(conn, h) {
        for (const sql of TABLAS) await conn.query(sql);
        // Una posición y un producto por lugar del Top 10
        if (!(await h.indiceExiste('Top10', 'idx_top10_posicion'))) {
            await conn.query('CREATE UNIQUE INDEX idx_top10_posicion ON Top10(posicion)');
        }
        if (!(await h.indiceExiste('Top10', 'idx_top10_producto'))) {
            await conn.query('CREATE UNIQUE INDEX idx_top10_producto ON Top10(producto_id)');
        }
    }
};
