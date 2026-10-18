// Paleta de la marca: copiar HEX/RGB/CMYK, verificar contraste WCAG y exportar la paleta
// (variables CSS, JSON o .gpl para Inkscape/GIMP/Krita).
import { useMemo, useState } from 'react';
import { toastOk } from '../comunes';
import { PALETA, COLORES, COMBINACIONES } from './datos';
import { hexARgb, rgbACmyk, contraste, nivelWcag, copiarTexto, descargarBlob } from './utilidades';

const TODOS = PALETA.flatMap((g) => g.colores);
const cmykDe = (c) => c.cmyk || rgbACmyk(hexARgb(c.hex)).join(' · ');

function copiar(valor, que) {
  copiarTexto(valor).then(() => toastOk(`${que} copiado: ${valor}`));
}

function Insignia({ ok, children }) {
  return <span className={`marca-wcag ${ok ? 'ok' : 'no'}`}><i className={`fas ${ok ? 'fa-check' : 'fa-times'}`} aria-hidden="true" />{children}</span>;
}

function exportar(formato) {
  if (formato === 'css') {
    const css = `:root {\n${TODOS.map((c) => `  --ad-${c.clave.replace(/_/g, '-')}: ${c.hex};`).join('\n')}\n}\n`;
    copiar(css, 'CSS');
    return;
  }
  if (formato === 'json') {
    const json = JSON.stringify(Object.fromEntries(TODOS.map((c) => [c.clave, { nombre: c.nombre, hex: c.hex, rgb: hexARgb(c.hex), cmyk: cmykDe(c), pantone: c.pantone || null }])), null, 2);
    descargarBlob(new Blob([json], { type: 'application/json' }), 'alta-densidad-paleta.json');
    return;
  }
  const gpl = ['GIMP Palette', 'Name: Alta Densidad', 'Columns: 6', '#',
    ...TODOS.map((c) => `${hexARgb(c.hex).map((v) => String(v).padStart(3)).join(' ')}\t${c.nombre}`)].join('\n');
  descargarBlob(new Blob([gpl + '\n'], { type: 'text/plain' }), 'alta-densidad-paleta.gpl');
}

export default function Paleta() {
  const [fondo, setFondo] = useState('tinta');
  const [texto, setTexto] = useState('oro_claro');
  const [libreFondo, setLibreFondo] = useState('');
  const [libreTexto, setLibreTexto] = useState('');

  const hexFondo = libreFondo || COLORES[fondo].hex;
  const hexTexto = libreTexto || COLORES[texto].hex;
  const ratio = contraste(hexFondo, hexTexto);
  const nivel = nivelWcag(ratio);

  const matriz = useMemo(() => COMBINACIONES.map(([f, t]) => ({ f, t, r: contraste(COLORES[f].hex, COLORES[t].hex) })), []);

  return (
    <>
      <div className="marca-subbarra">
        <p className="armador-ayuda">Haz clic en un valor para copiarlo. CMYK y Pantone son de referencia: se validan con una prueba de color de la imprenta.</p>
        <div className="admin-toolbar-actions">
          <button type="button" className="btn-secondary" onClick={() => exportar('css')}><i className="fab fa-css3-alt" /> Copiar CSS</button>
          <button type="button" className="btn-secondary" onClick={() => exportar('json')}><i className="fas fa-file-code" /> JSON</button>
          <button type="button" className="btn-secondary" onClick={() => exportar('gpl')} title="Paleta para Inkscape, GIMP y Krita"><i className="fas fa-palette" /> .gpl</button>
        </div>
      </div>

      {PALETA.map((g) => (
        <section key={g.grupo} className="marca-seccion">
          <header className="marca-seccion-cabeza"><h3>{g.grupo}</h3>{g.nota && <span className="marca-mute">{g.nota}</span>}</header>
          <ul className="marca-colores">
            {g.colores.map((c) => {
              const rgb = hexARgb(c.hex).join(', ');
              return (
                <li key={c.clave} className="marca-color">
                  <button type="button" className="marca-color-muestra" style={{ background: c.hex }} onClick={() => copiar(c.hex, 'HEX')}
                    aria-label={`Copiar ${c.hex}`}>
                    <span style={{ color: contraste(c.hex, '#0B0B0C') > contraste(c.hex, '#F4F1EA') ? '#0B0B0C' : '#F4F1EA' }}>{c.hex}</span>
                  </button>
                  <div className="marca-color-info">
                    <b>{c.nombre}</b>
                    {c.rol && <small className="marca-mute">{c.rol}</small>}
                    <dl>
                      <div><dt>RGB</dt><dd><button type="button" onClick={() => copiar(rgb, 'RGB')}>{rgb}</button></dd></div>
                      <div><dt>CMYK</dt><dd><button type="button" onClick={() => copiar(cmykDe(c), 'CMYK')}>{cmykDe(c)}</button>{!c.cmyk && <i className="marca-mute" title="Calculado desde el HEX"> *</i>}</dd></div>
                      {c.pantone && <div><dt>Pantone</dt><dd><button type="button" onClick={() => copiar(c.pantone, 'Pantone')}>{c.pantone}</button></dd></div>}
                    </dl>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <section className="marca-seccion">
        <header className="marca-seccion-cabeza"><h3>Verificador de contraste</h3><span className="marca-mute">WCAG 2.1 · texto normal 4,5:1 · texto grande 3:1</span></header>
        <div className="marca-contraste">
          <div className="marca-contraste-controles">
            <label>Fondo
              <select value={libreFondo ? '' : fondo} onChange={(e) => { setFondo(e.target.value); setLibreFondo(''); }}>
                {libreFondo && <option value="">Personalizado</option>}
                {TODOS.map((c) => <option key={c.clave} value={c.clave}>{c.nombre}</option>)}
              </select>
              <input type="color" value={hexFondo} onChange={(e) => setLibreFondo(e.target.value)} aria-label="Fondo personalizado" />
            </label>
            <label>Texto
              <select value={libreTexto ? '' : texto} onChange={(e) => { setTexto(e.target.value); setLibreTexto(''); }}>
                {libreTexto && <option value="">Personalizado</option>}
                {TODOS.map((c) => <option key={c.clave} value={c.clave}>{c.nombre}</option>)}
              </select>
              <input type="color" value={hexTexto} onChange={(e) => setLibreTexto(e.target.value)} aria-label="Texto personalizado" />
            </label>
            <button type="button" className="btn-secondary" onClick={() => {
              setFondo(texto); setTexto(fondo); setLibreFondo(libreTexto); setLibreTexto(libreFondo);
            }}><i className="fas fa-exchange-alt" /> Invertir</button>
          </div>
          <div className="marca-contraste-prueba" style={{ background: hexFondo, color: hexTexto }}>
            <span className="marca-contraste-eyebrow">Fragancias de Alta Densidad</span>
            <span className="marca-contraste-titular">Lo que <em>permanece.</em></span>
            <span className="marca-contraste-cuerpo">Alta concentración con feromonas. Envíos a toda Colombia.</span>
          </div>
          <div className="marca-contraste-resultado">
            <b className="marca-ratio">{ratio.toFixed(2)}<small>:1</small></b>
            <div className="marca-wcags">
              <Insignia ok={nivel.aaNormal}>AA texto</Insignia>
              <Insignia ok={nivel.aaGrande}>AA grande</Insignia>
              <Insignia ok={nivel.aaaNormal}>AAA texto</Insignia>
              <Insignia ok={nivel.aaaGrande}>AAA grande</Insignia>
            </div>
            <small className="marca-mute">
              {nivel.aaNormal ? 'Sirve para cualquier texto.' : nivel.aaGrande ? 'Solo para titulares grandes (24 px o 19 px en negrita en adelante).' : 'No usar para texto: solo para detalles decorativos.'}
            </small>
          </div>
        </div>

        <h4 className="up marca-subtitulo">Combinaciones de la marca</h4>
        <ul className="marca-matriz">
          {matriz.map(({ f, t, r }) => (
            <li key={`${f}-${t}`}>
              <button type="button" style={{ background: COLORES[f].hex, color: COLORES[t].hex }}
                onClick={() => { setFondo(f); setTexto(t); setLibreFondo(''); setLibreTexto(''); }}>
                <span className="marca-matriz-aa">Aa</span>
                <span className="marca-matriz-r">{r.toFixed(1)}:1</span>
              </button>
              <small>{COLORES[t].nombre} sobre {COLORES[f].nombre.toLowerCase()} <Insignia ok={r >= 4.5}>{r >= 4.5 ? 'AA' : r >= 3 ? 'Grande' : 'No'}</Insignia></small>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
