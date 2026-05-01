-- Crear tabla Ordenes para persistir órdenes generadas al crear preferencias MP
CREATE TABLE IF NOT EXISTS Ordenes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  external_reference VARCHAR(100) UNIQUE,
  items JSON,
  total DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'COP',
  status ENUM('pending','approved','cancelled','failed','refunded') DEFAULT 'pending',
  preference_id VARCHAR(100),
  payment_id VARCHAR(100),
  -- Campos de envío
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

