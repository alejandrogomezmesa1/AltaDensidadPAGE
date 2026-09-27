import { useState } from 'react';
import { LOGO, normalizarImagen } from '../lib/producto';

// Foto del producto; si no carga, frasco dibujado con el tono de su familia (--h) y escala (--s)
export function Frasco({ h, s, img, nombre, prioridad }) {
  const [fallo, setFallo] = useState(false);
  const estilo = { '--h': h || 32, '--s': s || 1.7 };
  if (!img) return <div className="bottle" style={estilo}><i /></div>;
  const carga = prioridad ? { loading: 'eager', fetchPriority: 'high' } : { loading: 'lazy', decoding: 'async' };
  return (
    <div className="bottle-wrap">
      {!fallo && (
        <img src={normalizarImagen(img)} alt={nombre || 'Fragancia'} className="stage-real-img" width="280" height="280" {...carga} onError={() => setFallo(true)} />
      )}
      <div className="bottle fallback-bottle" style={{ ...estilo, display: fallo ? 'grid' : 'none' }}><i /></div>
    </div>
  );
}

// Imagen que cae al logo si falla
export function ImagenLogo({ src, ...props }) {
  return <img src={src} {...props} onError={(e) => { if (!e.currentTarget.src.endsWith(LOGO)) e.currentTarget.src = LOGO; }} />;
}

// Controles de paginación de la tienda (← 1 2 … n →)
export function Paginacion({ actual, total, paginas, onCambiar, className = 'paginacion' }) {
  if (total <= 1) return <div className={className} />;
  return (
    <div className={className}>
      <button className="pag-btn" disabled={actual === 1} aria-label="Página anterior" onClick={() => onCambiar(actual - 1)}>←</button>
      {paginas.map((p, i) => (p === '...'
        ? <span key={`e${i}`} className="pag-ellipsis">…</span>
        : <button key={p} className={`pag-btn ${p === actual ? 'pag-active' : ''}`} aria-label={`Página ${p}`} onClick={() => onCambiar(p)}>{p}</button>))}
      <button className="pag-btn" disabled={actual === total} aria-label="Página siguiente" onClick={() => onCambiar(actual + 1)}>→</button>
    </div>
  );
}
