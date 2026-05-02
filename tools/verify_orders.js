const fetch = globalThis.fetch || require("node-fetch");
const path = require("path");
const { getConnection } = require(
  path.join(__dirname, "..", "backend", "config", "db"),
);

async function main() {
  const BACKEND = process.env.BACKEND_URL || "http://localhost:3000";
  const testEmail = process.env.TEST_EMAIL || "test@example.com";

  console.log("Usando BACKEND:", BACKEND);

  const payload = {
    items: [{ id: 1, name: "Producto Test", price: 10000, quantity: 1 }],
    shipping: {
      nombre: "Cliente Test",
      documento: "12345678",
      celular: "3001234567",
      ciudad: "Medellín",
      direccion: "Calle 1 #2-3",
      piso: "3A",
      municipio: "Medellín",
      barrio: "Centro",
      contactoAlt: "3007654321",
      referencia: "Prueba automática",
    },
  };

  try {
    console.log("POST /api/mercadopago/create_preference ...");
    const res = await fetch(BACKEND + "/api/mercadopago/create_preference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    console.log(
      "Respuesta create_preference:",
      data && data.success ? "OK" : "ERROR",
      data && data.message ? data.message : "",
    );

    let external = null;
    if (data && data.preference) {
      // puede venir en data.preference.external_reference
      external =
        data.preference.external_reference ||
        (data.preference &&
          data.preference.body &&
          data.preference.body.external_reference) ||
        null;
    }
    if (!external) {
      // intentar extraer de pref id o fallback: listar últimas órdenes
      console.warn(
        "No se obtuvo external_reference desde la preferencia. Buscaremos la última orden insertada.",
      );
    }

    const pool = await getConnection();
    let rows;
    if (external) {
      [rows] = await pool.query(
        "SELECT * FROM Ordenes WHERE external_reference = ? LIMIT 1",
        [external],
      );
    } else {
      [rows] = await pool.query(
        "SELECT * FROM Ordenes ORDER BY created_at DESC LIMIT 5",
      );
    }

    console.log("Filas encontradas en Ordenes: ", rows.length);
    rows.forEach((r) =>
      console.log({
        id: r.id,
        external_reference: r.external_reference,
        total: r.total,
        status: r.status,
        created_at: r.created_at,
      }),
    );

    process.exit(0);
  } catch (err) {
    console.error(
      "Error en verificación:",
      err && err.message ? err.message : err,
    );
    process.exit(2);
  }
}

if (require.main === module) main();
