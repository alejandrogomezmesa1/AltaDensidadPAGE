// Opiniones de clientes de un producto: espacio reservado en cada parada del Top 10.
//
// PENDIENTE (siguiente funcionalidad):
//   - Backend: tabla de opiniones (producto_id, cliente, calificación 1–5, texto, fecha, aprobada)
//     y rutas GET /api/productos/:id/opiniones (públicas, solo aprobadas) y POST (clientes con compra).
//   - Aquí: cargar las opiniones del producto, mostrar el promedio real en lugar de `rating`
//     y listar las más recientes; el contenedor ya tiene su sitio y su estilo en la parada.
export default function Opiniones({ productoId, rating = 5 }) {
  const estrellas = Math.max(0, Math.min(5, Math.round(Number(rating) || 5)));
  return (
    <section className="opiniones" data-producto={productoId} aria-label="Opiniones de clientes">
      <div className="opiniones-cab">
        <span className="up opiniones-t">Opiniones</span>
        <span className="stars" aria-label={`${estrellas} de 5 estrellas`}>{'★'.repeat(estrellas)}{'☆'.repeat(5 - estrellas)}</span>
      </div>
      <p className="opiniones-pronto">Muy pronto podrás leer aquí lo que opinan quienes ya la llevan.</p>
    </section>
  );
}
