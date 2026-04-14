-- Tabla para el Top 10 de productos destacados
CREATE TABLE IF NOT EXISTS Top10 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    posicion INT NOT NULL,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES Productos(id) ON DELETE CASCADE
);
-- Solo debe haber una fila por posicion (1-10)
CREATE UNIQUE INDEX idx_top10_posicion ON Top10(posicion);
CREATE UNIQUE INDEX idx_top10_producto ON Top10(producto_id);