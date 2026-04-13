-- ============================================================
-- BASE DE DATOS: AltaDensidadDB
-- Perfumería de Alta Densidad
-- ============================================================

USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'AltaDensidadDB')
BEGIN
    CREATE DATABASE AltaDensidadDB;
END
GO

USE AltaDensidadDB;
GO

-- ============================================================
-- TABLA: Productos (fragancias del catálogo)
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Productos' AND xtype='U')
BEGIN
    CREATE TABLE Productos (
        id          INT PRIMARY KEY IDENTITY(1,1),
        nombre      NVARCHAR(200)   NOT NULL,
        rating      INT             NOT NULL DEFAULT 4 CHECK (rating BETWEEN 1 AND 5),
        imagen      NVARCHAR(300)   NOT NULL DEFAULT '',
        categoria   NVARCHAR(100)   NOT NULL,
        genero      NVARCHAR(50)    NOT NULL,
        descripcion NVARCHAR(MAX)   NOT NULL DEFAULT '',
        precio      DECIMAL(10,2)   NOT NULL DEFAULT 0,
        activo      BIT             NOT NULL DEFAULT 1,
        creado_en   DATETIME        NOT NULL DEFAULT GETDATE()
    );
END
GO

-- ============================================================
-- TABLA: ProductoTallas (relación tallas por producto)
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ProductoTallas' AND xtype='U')
BEGIN
    CREATE TABLE ProductoTallas (
        id          INT PRIMARY KEY IDENTITY(1,1),
        producto_id INT NOT NULL REFERENCES Productos(id),
        talla       NVARCHAR(20) NOT NULL
    );
END
GO

-- ============================================================
-- TABLA: ProductoTiposEnvase (tipos de envase por producto)
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ProductoTiposEnvase' AND xtype='U')
BEGIN
    CREATE TABLE ProductoTiposEnvase (
        id          INT PRIMARY KEY IDENTITY(1,1),
        producto_id INT NOT NULL REFERENCES Productos(id),
        tipo_envase NVARCHAR(100) NOT NULL
    );
END
GO

-- ============================================================
-- TABLA: Envases
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Envases' AND xtype='U')
BEGIN
    CREATE TABLE Envases (
        id          INT PRIMARY KEY IDENTITY(1,1),
        nombre      NVARCHAR(200)   NOT NULL,
        imagen      NVARCHAR(300)   NOT NULL DEFAULT '',
        material    NVARCHAR(100)   NOT NULL DEFAULT 'Vidrio',
        descripcion NVARCHAR(MAX)   NOT NULL DEFAULT '',
        precio      DECIMAL(10,2)   NOT NULL DEFAULT 0,
        activo      BIT             NOT NULL DEFAULT 1,
        creado_en   DATETIME        NOT NULL DEFAULT GETDATE()
    );
END
GO

-- ============================================================
-- TABLA: EnvaseTallas
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='EnvaseTallas' AND xtype='U')
BEGIN
    CREATE TABLE EnvaseTallas (
        id          INT PRIMARY KEY IDENTITY(1,1),
        envase_id   INT NOT NULL REFERENCES Envases(id),
        talla       NVARCHAR(20) NOT NULL
    );
END
GO

-- ============================================================
-- TABLA: Usuarios (para login/registro)
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Usuarios' AND xtype='U')
BEGIN
    CREATE TABLE Usuarios (
        id              INT PRIMARY KEY IDENTITY(1,1),
        nombre          NVARCHAR(100)   NOT NULL,
        email           NVARCHAR(200)   NOT NULL UNIQUE,
        password_hash   NVARCHAR(300)   NOT NULL,
        rol             NVARCHAR(20)    NOT NULL DEFAULT 'cliente' CHECK (rol IN ('admin', 'cliente')),
        activo          BIT             NOT NULL DEFAULT 1,
        creado_en       DATETIME        NOT NULL DEFAULT GETDATE()
    );
END
GO

-- ============================================================
-- DATOS INICIALES: Productos
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM Productos)
BEGIN
    INSERT INTO Productos (nombre, rating, imagen, categoria, genero, descripcion, precio) VALUES
    ('212 VIP ROSE CAROLINA HERRERA',   4, 'img/212-vip-rose.jpg',       'Diseñador', 'Mujer',  'Es una fragancia femenina con un aire fresco y dinámico. Representa el glamour juvenil y la autenticidad intrépida, ideal para quienes viven la vida al máximo y destacan con seguridad', 0),
    ('GOOD GIRL CAROLINA HERRERA',      4, 'img/GOOD_GIRL.jpg',          'Diseñador', 'Mujer',  'La dualidad entre la dulzura y la intensidad. Good Girl combina la frescura del jazmín y la almendra con la profundidad del cacao y el café, creando un aroma seductor y poderoso.', 0),
    ('212 VIP BLACK CAROLINA HERRERA',  5, 'img/VIP_212_BLACK.jpg',      'Diseñador', 'Hombre', 'La esencia de la exclusividad. Un perfume oriental especiado, con una salida de absenta y anís, seguida por un corazón de lavanda y cuero.', 0),
    ('LIGHT BLUE DOLCE & GABBANA',      5, 'img/ligth_blue.jpg',         'Diseñador', 'Mujer',  'Inspirado en la frescura y sensualidad del Mediterráneo.', 0),
    ('SANTAL 33',                       4, 'img/SANTAL_33.jpg',          'Diseñador', 'Unisex', 'La esencia de la sofisticación moderna. Una fragancia amaderada especiada con notas de sándalo, cardamomo y cuero.', 0),
    ('COCO MADEMOISELLE CHANEL',        4, 'img/COCO.jpg',               'Diseñador', 'Mujer',  'Un clásico moderno que encapsula la esencia de la sofisticación.', 0),
    ('BLEU CHANEL',                     4, 'img/BLEU.jpg',               'Diseñador', 'Hombre', 'Es una fragancia amaderada aromática, con una apertura fresca de limón, menta y pimienta rosa.', 0),
    ('AHLI KARPOS',                     4, 'img/AHLI_KARPOS.jpeg',       'Arabe',     'Unisex', 'Es una fragancia que evoca la frescura tropical y la dulzura especiada.', 0),
    ('AHLI CORVUS',                     4, 'img/CORVUS.webp',            'Arabe',     'Unisex', 'Es una fragancia que combina notas frutales, florales y amaderadas.', 0),
    ('ERBA PURA XERJOFF',              5, 'img/ERBA_PURA.avif',         'Arabe',     'Unisex', 'Una fragancia que captura la esencia de la frescura mediterránea.', 0);

    -- Tallas para todos los productos
    INSERT INTO ProductoTallas (producto_id, talla)
    SELECT p.id, t.talla
    FROM Productos p
    CROSS JOIN (VALUES ('30ml'), ('60ml'), ('100ml')) AS t(talla);

    -- Tipos de envase para todos los productos
    INSERT INTO ProductoTiposEnvase (producto_id, tipo_envase)
    SELECT p.id, e.tipo
    FROM Productos p
    CROSS JOIN (VALUES ('Singler'), ('Cartier'), ('Swarosky')) AS e(tipo);
END
GO

-- ============================================================
-- DATOS INICIALES: Envases
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM Envases)
BEGIN
    INSERT INTO Envases (nombre, imagen, material, descripcion, precio) VALUES
    ('AMIRA',       'img/AMIRA.jpeg',           'Vidrio', 'Un envase elegante y compacto de vidrio, diseñado para realzar la exclusividad de cada fragancia.', 0),
    ('CARTIER',     'img/cartier.jpeg',          'Vidrio', 'Un envase que evoca la elegancia y el prestigio de la alta joyería.', 0),
    ('CILINDRO',    'img/CILINDRO.jpeg',         'Vidrio', 'Un envase que transmite solidez y equilibrio gracias a su forma geométrica.', 0),
    ('EROS',        'img/EROS.jpeg',             'Vidrio', 'Un envase que simboliza pasión y magnetismo.', 0),
    ('VICTORY',     'img/VICTORY.jpeg',          'Vidrio', 'Un envase que representa triunfo y superación.', 0),
    ('GOOD GIRL',   'img/GOOD_GIRL.jpeg',        'Vidrio', 'Un envase que refleja frescura y modernidad.', 0),
    ('CALAVERA',    'img/calavera1.jpeg',         'Vidrio', 'Un envase llamativo y original que transmite rebeldía y misterio.', 0),
    ('MINI YARA',   'img/yaritas.jpeg',           'Vidrio', 'Un envase compacto y elegante que refleja delicadeza y feminidad.', 0);

    -- Tallas para envases
    INSERT INTO EnvaseTallas (envase_id, talla) VALUES
    (1, '30ml'), (2, '30ml'), (2, '60ml'), (3, '100ml'),
    (4, '60ml'), (5, '60ml'), (6, '30ml'), (7, '50ml'), (8, '30ml');
END
GO

PRINT 'Base de datos AltaDensidadDB configurada correctamente.';
GO
mysql -h mysql://root:Railway2024Secure@mainline.proxy.rlwy.net -u root -p -P 54310 railway
