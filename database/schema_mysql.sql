-- ============================================================
-- BASE DE DATOS: altadensidad  (MySQL / XAMPP)
-- Perfumería de Alta Densidad
-- ============================================================

CREATE DATABASE IF NOT EXISTS altadensidad
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE altadensidad;

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
    FOREIGN KEY (producto_id) REFERENCES Productos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLA: ProductoTiposEnvase
-- ============================================================
CREATE TABLE IF NOT EXISTS ProductoTiposEnvase (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    producto_id INT NOT NULL,
    tipo_envase VARCHAR(100) NOT NULL,
    FOREIGN KEY (producto_id) REFERENCES Productos(id)
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
    FOREIGN KEY (envase_id) REFERENCES Envases(id)
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
    creado_en       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
