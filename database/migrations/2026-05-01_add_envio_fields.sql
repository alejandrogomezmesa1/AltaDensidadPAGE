-- Migración: agregar columnas de envío a la tabla Ordenes (si no existen)
ALTER TABLE Ordenes
  ADD COLUMN IF NOT EXISTS envio_piso VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS envio_municipio VARCHAR(150) NULL,
  ADD COLUMN IF NOT EXISTS envio_barrio VARCHAR(150) NULL,
  ADD COLUMN IF NOT EXISTS envio_contacto_alt VARCHAR(60) NULL,
  ADD COLUMN IF NOT EXISTS envio_referencia TEXT NULL;

-- Nota: Algunas versiones de MySQL/MariaDB no soportan "ADD COLUMN IF NOT EXISTS" en todas las combinaciones.
-- Si el comando falla, asegúrate de ejecutar checks manuales:
-- SHOW COLUMNS FROM Ordenes LIKE 'envio_piso';
-- Y ejecutar ALTER TABLE solo para las columnas que falten.
