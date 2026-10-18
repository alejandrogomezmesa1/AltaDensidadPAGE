// Probador tipográfico: escribe una frase y mírala en las fuentes y la jerarquía de la marca.
import { useState } from 'react';
import { toastOk } from '../comunes';
import { FUENTES, JERARQUIA, REGLAS_TIPO } from './datos';
import { copiarTexto } from './utilidades';

const F = Object.fromEntries(FUENTES.map((f) => [f.clave, f]));
const estiloDe = (f, px, track = 0, mayus = false) => ({
  fontFamily: f.familia, fontWeight: f.peso, fontStyle: f.estilo, fontSize: px, letterSpacing: `${track}em`, textTransform: mayus ? 'uppercase' : 'none'
});

export default function Tipografia() {
  const [frase, setFrase] = useState('Lo que permanece.');
  const [tam, setTam] = useState(48);
  const [track, setTrack] = useState(0);
  const [mayus, setMayus] = useState(false);
  const [oscuro, setOscuro] = useState(true);
  const texto = frase || 'Escribe algo…';
  const avisoMayus = mayus && track < 0.1;

  return (
    <>
      <div className="marca-tipo-controles">
        <label className="marca-tipo-frase">Frase
          <input type="text" value={frase} onChange={(e) => setFrase(e.target.value)} maxLength={120} />
        </label>
        <label>Tamaño <b>{tam}px</b>
          <input type="range" min="10" max="120" value={tam} onChange={(e) => setTam(Number(e.target.value))} />
        </label>
        <label>Espaciado <b>{track.toFixed(2)}em</b>
          <input type="range" min="-0.02" max="0.4" step="0.01" value={track} onChange={(e) => setTrack(Number(e.target.value))} />
        </label>
        <div className="marca-fila">
          <button type="button" className={`marca-toggle ${mayus ? 'activo' : ''}`} onClick={() => setMayus(!mayus)} aria-pressed={mayus}>AA Mayúsculas</button>
          <button type="button" className={`marca-toggle ${oscuro ? 'activo' : ''}`} onClick={() => setOscuro(!oscuro)} aria-pressed={oscuro}>
            <i className={oscuro ? 'fas fa-moon' : 'fas fa-sun'} /> {oscuro ? 'Tinta' : 'Hueso'}
          </button>
        </div>
      </div>
      {avisoMayus && <p className="marca-aviso"><i className="fas fa-exclamation-triangle" /> Regla de la marca: las MAYÚSCULAS van siempre con espaciado (0,22 em en eyebrows).</p>}

      <ul className={`marca-tipos ${oscuro ? 'marca-tipos--oscuro' : ''}`}>
        {FUENTES.map((f) => {
          const prohibida = mayus && f.familia.includes('Cormorant');
          return (
            <li key={f.clave} className={prohibida ? 'marca-tipo-prohibida' : ''}>
              <div className="marca-tipo-meta">
                <small>{f.nombre}</small>
                {prohibida && <small className="marca-tipo-alerta">Mayúsculas solo en Jost</small>}
                <button type="button" className="marca-icono-btn" title="Copiar CSS" aria-label={`Copiar CSS de ${f.nombre}`}
                  onClick={() => copiarTexto(`font-family: ${f.familia}; font-weight: ${f.peso};${f.estilo === 'italic' ? ' font-style: italic;' : ''} font-size: ${tam}px; letter-spacing: ${track}em;${mayus ? ' text-transform: uppercase;' : ''}`).then(() => toastOk('CSS copiado'))}>
                  <i className="fas fa-code" />
                </button>
              </div>
              <p style={estiloDe(f, tam, track, mayus)}>{texto}</p>
            </li>
          );
        })}
      </ul>

      <section className="marca-seccion">
        <header className="marca-seccion-cabeza"><h3>Jerarquía (B2.3)</h3></header>
        <ul className="marca-jerarquia">
          {JERARQUIA.map((j) => (
            <li key={j.nivel}>
              <div className="marca-jerarquia-meta">
                <b>{j.nivel}</b>
                <small className="marca-mute">{F[j.fuente].nombre} · {j.medida}</small>
                <small className="marca-mute">{j.regla}</small>
              </div>
              <p style={estiloDe(F[j.fuente], j.px, j.track || 0, j.mayus)}>
                {j.ejemplo}{j.ejemplo2 && <><br /><em className="marca-oro" style={{ fontStyle: 'italic' }}>{j.ejemplo2}</em></>}
              </p>
            </li>
          ))}
        </ul>
        <ul className="marca-reglas">
          {REGLAS_TIPO.map((r) => <li key={r}><i className="fas fa-check" aria-hidden="true" /> {r}</li>)}
        </ul>
      </section>
    </>
  );
}
