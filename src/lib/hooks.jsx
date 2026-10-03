import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useState } from 'react';
import { SITIO } from '../config';

// ── Tema claro/oscuro: html.modo-claro + data-theme, persistido en localStorage ──
const TemaContext = createContext(null);

export function TemaProvider({ children }) {
  const [claro, setClaro] = useState(() => document.documentElement.classList.contains('modo-claro'));

  const alternar = useCallback(() => {
    setClaro((antes) => {
      const ahora = !antes;
      document.documentElement.classList.toggle('modo-claro', ahora);
      document.documentElement.setAttribute('data-theme', ahora ? 'light' : 'dark');
      try { localStorage.setItem('altadensidad_tema', ahora ? 'claro' : 'oscuro'); } catch { /* sin almacenamiento */ }
      return ahora;
    });
  }, []);

  return <TemaContext.Provider value={{ claro, alternar }}>{children}</TemaContext.Provider>;
}

export const useTema = () => useContext(TemaContext);

// Botón de tema del encabezado de la tienda y de las páginas de acceso
export function BotonTema() {
  const { claro, alternar } = useTema();
  const txt = claro ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro';
  return (
    <button type="button" className="nav-ico" aria-label={txt} title={txt} onClick={alternar}>
      <i className={claro ? 'fa-solid fa-moon' : 'fa-solid fa-sun'} aria-hidden="true" />
    </button>
  );
}

// ── Metadatos de cada página (título, descripción, canónica, Open Graph, robots) ──
function fijarMeta(selector, atributo, valor) {
  const el = document.head.querySelector(selector);
  if (el && valor != null) el.setAttribute(atributo, valor);
}

export function usePagina({ titulo, descripcion, ruta = '/', ogTitulo, ogDescripcion, indexar = true }) {
  useEffect(() => {
    document.title = titulo;
    const url = SITIO + ruta;
    fijarMeta('meta[name="description"]', 'content', descripcion);
    fijarMeta('link[rel="canonical"]', 'href', url);
    fijarMeta('meta[property="og:url"]', 'content', url);
    fijarMeta('meta[property="og:title"]', 'content', ogTitulo || titulo);
    fijarMeta('meta[property="og:description"]', 'content', ogDescripcion || descripcion);
    fijarMeta('meta[name="robots"]', 'content', indexar ? 'index, follow' : 'noindex, nofollow');
  }, [titulo, descripcion, ruta, ogTitulo, ogDescripcion, indexar]);
}

// ── Clases en <body> mientras el componente está montado ──
export function useClaseBody(...clases) {
  const clave = clases.filter(Boolean).join(' ');
  useEffect(() => {
    if (!clave) return undefined;
    const lista = clave.split(' ');
    document.body.classList.add(...lista);
    return () => document.body.classList.remove(...lista);
  }, [clave]);
}

// Datos estructurados JSON-LD
export function JsonLd({ datos }) {
  if (!datos) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datos).replace(/</g, '\\u003c') }} />;
}

// ── Columnas reales de una rejilla (grid con auto-fill): se miden antes de pintar y al cambiar de ancho ──
export function useColumnas(ref, inicial = 3) {
  const [columnas, setColumnas] = useState(inicial);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const medir = () => {
      const n = getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length;
      if (n) setColumnas(n);
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return columnas;
}
