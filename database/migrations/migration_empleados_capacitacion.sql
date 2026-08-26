-- ============================================================
-- MIGRACIÓN: Rol Empleado, Módulos de Capacitación e Inducción
-- Alta Densidad
-- ============================================================

USE railway;

-- 1. Modificar restricción de rol en Usuarios y agregar campos de inducción
ALTER TABLE Usuarios MODIFY COLUMN rol VARCHAR(20) NOT NULL DEFAULT 'cliente';

-- Agregar columnas de estado de inducción en Usuarios
ALTER TABLE Usuarios
    ADD COLUMN estado_induccion VARCHAR(30) NOT NULL DEFAULT 'pendiente_capacitacion',
    ADD COLUMN intentos_examen INT NOT NULL DEFAULT 0,
    ADD COLUMN ultimo_puntaje INT NOT NULL DEFAULT 0,
    ADD COLUMN autorizado_por INT NULL,
    ADD COLUMN fecha_autorizacion DATETIME NULL;

-- 2. TABLA: CapacitacionItems (Módulos de inducción)
CREATE TABLE IF NOT EXISTS CapacitacionItems (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    titulo      VARCHAR(200) NOT NULL,
    contenido   TEXT NOT NULL,
    orden       INT NOT NULL DEFAULT 1,
    activo      TINYINT(1) NOT NULL DEFAULT 1,
    creado_en   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. TABLA: CapacitacionPreguntas (Preguntas por ítem y del examen final)
CREATE TABLE IF NOT EXISTS CapacitacionPreguntas (
    id                 INT PRIMARY KEY AUTO_INCREMENT,
    item_id            INT NULL,
    pregunta           TEXT NOT NULL,
    opciones           JSON NOT NULL,
    respuesta_correcta INT NOT NULL,
    explicacion        TEXT NULL,
    orden              INT NOT NULL DEFAULT 1,
    FOREIGN KEY (item_id) REFERENCES CapacitacionItems(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. TABLA: UsuarioProgresoInduccion (Progreso por módulo por empleado)
CREATE TABLE IF NOT EXISTS UsuarioProgresoInduccion (
    id               INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id       INT NOT NULL,
    item_id          INT NOT NULL,
    completado       TINYINT(1) NOT NULL DEFAULT 1,
    fecha_completado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_usuario_item (usuario_id, item_id),
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (item_id) REFERENCES CapacitacionItems(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
