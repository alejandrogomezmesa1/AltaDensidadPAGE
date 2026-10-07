// Una fila por mensaje atendido por el asistente AURA, para el monitoreo del panel.
// No guarda el texto de las conversaciones: solo si salió bien, cuánto tardó y cuántos
// productos inexistentes borró la verificación. Las filas de más de 30 días se purgan solas.
module.exports = {
    nombre: 'Métricas del chatbot',
    async up(conn) {
        await conn.query(`CREATE TABLE IF NOT EXISTS ChatbotMetricas (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            origen VARCHAR(10) NOT NULL DEFAULT 'cliente',
            ok TINYINT(1) NOT NULL,
            latencia_ms INT NOT NULL,
            productos_eliminados INT NOT NULL DEFAULT 0,
            error VARCHAR(160) NULL,
            INDEX idx_chatbot_metricas_fecha (fecha)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    }
};
