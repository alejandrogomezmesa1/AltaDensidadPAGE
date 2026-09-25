-- Configuración del proveedor de IA del asistente AURA.
-- El backend crea esta tabla automáticamente (routes/chatbot.js); este archivo es solo referencia.
-- La API key se guarda cifrada (AES-256-GCM) y nunca se devuelve completa por la API.
CREATE TABLE IF NOT EXISTS ConfigChatbot (
    id TINYINT PRIMARY KEY,               -- siempre 1 (una sola configuración)
    url VARCHAR(500) NULL,                -- URL base del proveedor, sin /chat
    api_key_cifrada TEXT NULL,
    modo VARCHAR(20) NOT NULL DEFAULT 'nativo',   -- nativo | openai
    modelo VARCHAR(120) NULL,             -- solo modo openai
    activo TINYINT(1) NOT NULL DEFAULT 1,
    actualizado_en DATETIME NULL,
    actualizado_por VARCHAR(120) NULL
);
