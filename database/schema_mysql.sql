-- ============================================================
-- BASE DE DATOS: altadensidad  (MySQL / XAMPP)
-- Perfumería de Alta Densidad
-- ============================================================

CREATE DATABASE IF NOT EXISTS railway
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE railway;

-- ============================================================
-- TABLA: Productos
-- ============================================================
CREATE TABLE IF NOT EXISTS Productos (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    nombre      VARCHAR(200)    NOT NULL,
    rating      INT             NOT NULL DEFAULT 4,
    imagen      VARCHAR(300)    NOT NULL DEFAULT '',
    categoria   VARCHAR(100)    NOT NULL,
    genero      VARCHAR(50)     NOT NULL,
    descripcion TEXT            NOT NULL,
    precio      DECIMAL(10,2)   NOT NULL DEFAULT 0,
    activo      TINYINT(1)      NOT NULL DEFAULT 1,
    creado_en   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLA: ProductoTallas
-- ============================================================
CREATE TABLE IF NOT EXISTS ProductoTallas (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    producto_id INT NOT NULL,
    talla       VARCHAR(20) NOT NULL,
    FOREIGN KEY (producto_id) REFERENCES Productos(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLA: ProductoTiposEnvase
-- ============================================================
CREATE TABLE IF NOT EXISTS ProductoTiposEnvase (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    producto_id INT NOT NULL,
    tipo_envase VARCHAR(100) NOT NULL,
    FOREIGN KEY (producto_id) REFERENCES Productos(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLA: Envases
-- ============================================================
CREATE TABLE IF NOT EXISTS Envases (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    nombre      VARCHAR(200)    NOT NULL,
    imagen      VARCHAR(300)    NOT NULL DEFAULT '',
    material    VARCHAR(100)    NOT NULL,
    descripcion TEXT            NOT NULL,
    precio      DECIMAL(10,2)   NOT NULL DEFAULT 0,
    activo      TINYINT(1)      NOT NULL DEFAULT 1,
    creado_en   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLA: EnvaseTallas
-- ============================================================
CREATE TABLE IF NOT EXISTS EnvaseTallas (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    envase_id   INT NOT NULL,
    talla       VARCHAR(20) NOT NULL,
    FOREIGN KEY (envase_id) REFERENCES Envases(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLA: Usuarios
-- ============================================================
CREATE TABLE IF NOT EXISTS Usuarios (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    nombre          VARCHAR(100)    NOT NULL,
    email           VARCHAR(200)    NOT NULL UNIQUE,
    password_hash   VARCHAR(300)    NOT NULL,
    rol             ENUM('admin','cliente') NOT NULL DEFAULT 'cliente',
    activo          TINYINT(1)      NOT NULL DEFAULT 1,
    creado_en       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reset_token     VARCHAR(255),
    reset_token_expires DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- ============================================================
-- BASE DE DATOS: railway (MySQL)
-- Perfumería de Alta Densidad
-- ============================================================

-- TABLA: Productos
CREATE TABLE IF NOT EXISTS Productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    rating INT NOT NULL DEFAULT 4,
    imagen VARCHAR(300) NOT NULL DEFAULT '',
    categoria VARCHAR(100) NOT NULL,
    genero VARCHAR(50) NOT NULL,
    descripcion TEXT NOT NULL,
    precio DECIMAL(10,2) NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT 1,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (rating BETWEEN 1 AND 5)
);

-- TABLA: ProductoTallas
CREATE TABLE IF NOT EXISTS ProductoTallas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    talla VARCHAR(20) NOT NULL,
    FOREIGN KEY (producto_id) REFERENCES Productos(id)
);

-- TABLA: ProductoTiposEnvase
CREATE TABLE IF NOT EXISTS ProductoTiposEnvase (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    tipo_envase VARCHAR(100) NOT NULL,
    FOREIGN KEY (producto_id) REFERENCES Productos(id)
);

-- TABLA: Envases
CREATE TABLE IF NOT EXISTS Envases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    imagen VARCHAR(300) NOT NULL DEFAULT '',
    material VARCHAR(100) NOT NULL DEFAULT 'Vidrio',
    descripcion TEXT NOT NULL,
    precio DECIMAL(10,2) NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT 1,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- TABLA: EnvaseTallas
CREATE TABLE IF NOT EXISTS EnvaseTallas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    envase_id INT NOT NULL,
    talla VARCHAR(20) NOT NULL,
    FOREIGN KEY (envase_id) REFERENCES Envases(id)
);

-- TABLA: Usuarios
CREATE TABLE IF NOT EXISTS Usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(200) NOT NULL UNIQUE,
    password_hash VARCHAR(300) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'cliente',
    activo BOOLEAN NOT NULL DEFAULT 1,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reset_token VARCHAR(255) NULL,
    reset_token_expires DATETIME NULL,
    CHECK (rol IN ('admin', 'cliente'))
);

-- DATOS INICIALES: Productos
INSERT INTO Productos (nombre, rating, imagen, categoria, genero, descripcion, precio) VALUES
('212 VIP ROSE CAROLINA HERRERA',   4, 'assets/img/212-vip-rose.jpg',       'Diseñador', 'Mujer',  'Es una fragancia femenina con un aire fresco y dinámico. Representa el glamour juvenil y la autenticidad intrépida, ideal para quienes viven la vida al máximo y destacan con seguridad', 0),
('GOOD GIRL CAROLINA HERRERA',      4, 'assets/img/GOOD_GIRL.jpg',          'Diseñador', 'Mujer',  'La dualidad entre la dulzura y la intensidad. Good Girl combina la frescura del jazmín y la almendra con la profundidad del cacao y el café, creando un aroma seductor y poderoso.', 0),
('212 VIP BLACK CAROLINA HERRERA',  5, 'assets/img/VIP_212_BLACK.jpg',      'Diseñador', 'Hombre', 'La esencia de la exclusividad. Un perfume oriental especiado, con una salida de absenta y anís, seguida por un corazón de lavanda y cuero.', 0),
('LIGHT BLUE DOLCE & GABBANA',      5, 'assets/img/ligth_blue.jpg',         'Diseñador', 'Mujer',  'Inspirado en la frescura y sensualidad del Mediterráneo.', 0),
('SANTAL 33',                       4, 'assets/img/SANTAL_33.jpg',          'Diseñador', 'Unisex', 'La esencia de la sofisticación moderna. Una fragancia amaderada especiada con notas de sándalo, cardamomo y cuero.', 0),
('COCO MADEMOISELLE CHANEL',        4, 'assets/img/COCO.jpg',               'Diseñador', 'Mujer',  'Un clásico moderno que encapsula la esencia de la sofisticación.', 0),
('BLEU CHANEL',                     4, 'assets/img/BLEU.jpg',               'Diseñador', 'Hombre', 'Es una fragancia amaderada aromática, con una apertura fresca de limón, menta y pimienta rosa.', 0),
('AHLI KARPOS',                     4, 'assets/img/AHLI_KARPOS.jpeg',       'Arabe',     'Unisex', 'Es una fragancia que evoca la frescura tropical y la dulzura especiada.', 0),
('AHLI CORVUS',                     4, 'assets/img/CORVUS.webp',            'Arabe',     'Unisex', 'Es una fragancia que combina notas frutales, florales y amaderadas.', 0),
('ERBA PURA XERJOFF',              5, 'assets/img/ERBA_PURA.avif',         'Arabe',     'Unisex', 'Una fragancia que captura la esencia de la frescura mediterránea.', 0);

-- DATOS INICIALES: Envases
INSERT INTO Envases (nombre, imagen, material, descripcion, precio) VALUES
('AMIRA',       'assets/img/AMIRA.jpeg',           'Vidrio', 'Un envase elegante y compacto de vidrio, diseñado para realzar la exclusividad de cada fragancia.', 0),
('CARTIER',     'assets/img/cartier.jpeg',         'Vidrio', 'Un envase que evoca la elegancia y el prestigio de la alta joyería.', 0),
('CILINDRO',    'assets/img/CILINDRO.jpeg',        'Vidrio', 'Un envase que transmite solidez y equilibrio gracias a su forma geométrica.', 0),
('EROS',        'assets/img/EROS.jpeg',            'Vidrio', 'Un envase que simboliza pasión y magnetismo.', 0),
('VICTORY',     'assets/img/VICTORY.jpeg',         'Vidrio', 'Un envase que representa triunfo y superación.', 0),
('GOOD GIRL',   'assets/img/GOOD_GIRL.jpeg',       'Vidrio', 'Un envase que refleja frescura y modernidad.', 0),
('CALAVERA',    'assets/img/calavera1.jpeg',       'Vidrio', 'Un envase llamativo y original que transmite rebeldía y misterio.', 0),
('MINI YARA',   'assets/img/yaritas.jpeg',         'Vidrio', 'Un envase compacto y elegante que refleja delicadeza y feminidad.', 0);

