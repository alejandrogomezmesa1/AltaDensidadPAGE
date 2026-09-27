// Configuración del asistente AURA (una sola fila, id = 1). La API key va cifrada.
module.exports = {
    nombre: 'Configuración del chatbot',
    async up(conn) {
        await conn.query(`
            CREATE TABLE IF NOT EXISTS ConfigChatbot (
                id TINYINT PRIMARY KEY,
                url VARCHAR(500) NULL,
                api_key_cifrada TEXT NULL,
                modo VARCHAR(20) NOT NULL DEFAULT 'nativo',
                modelo VARCHAR(120) NULL,
                activo TINYINT(1) NOT NULL DEFAULT 1,
                actualizado_en DATETIME NULL,
                actualizado_por VARCHAR(120) NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
    }
};
