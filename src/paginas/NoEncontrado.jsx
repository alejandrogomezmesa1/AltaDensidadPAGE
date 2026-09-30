// Página "no encontrado": una dirección que no existe, o el enlace a un perfume o kit que ya no
// está. En vez de mandar al inicio sin aviso, lo dice y sugiere lo más parecido a lo buscado.
import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTienda } from '../tienda/TiendaContext';
import { usePagina } from '../lib/hooks';
import { slug as aSlug, perfumes11 } from '../lib/producto';

// Palabras del enlace que coinciden con el nombre (ignora las muy cortas)
const palabras = (t) => aSlug(t).split('-').filter((w) => w.length > 2);

export default function NoEncontrado({ tipo, buscado = '' }) {
  const { P, KITS, rutaPerfume, rutaKit } = useTienda();
  const { pathname } = useLocation();
  // Sin slug (ruta inexistente cualquiera), se sugiere a partir de la última parte de la dirección
  const texto = buscado || pathname.split('/').filter(Boolean).pop() || '';
  usePagina({ titulo: 'No encontrado | Fragancias de Alta Densidad', descripcion: 'La página que buscas no existe.', ruta: '/', indexar: false });

  const sugerencias = useMemo(() => {
    const buscadas = palabras(decodeURIComponent(texto));
    if (!buscadas.length) return [];
    const candidatos = [
      ...(tipo !== 'kit' ? perfumes11(P).map((p) => ({ id: p.id, nombre: p.n, kit: false })) : []),
      ...KITS.filter((k) => k.activo !== 0).map((k) => ({ id: k.id, nombre: k.nombre, kit: true }))
    ];
    return candidatos
      .map((c) => ({ ...c, puntos: palabras(c.nombre).filter((w) => buscadas.some((b) => w.startsWith(b) || b.startsWith(w))).length }))
      .filter((c) => c.puntos > 0)
      .sort((a, b) => b.puntos - a.puntos || a.nombre.localeCompare(b.nombre))
      .slice(0, 6);
  }, [P, KITS, tipo, texto]);

  return (
    <main className="sec no-encontrado">
      <div className="wrap">
        <span className="up eyebrow">Error 404</span>
        <h1 className="page-t">{tipo ? <>No encontramos<br /><em>{tipo === 'kit' ? 'ese kit.' : 'ese perfume.'}</em></> : <>Esta página<br /><em>no existe.</em></>}</h1>
        <p className="mute" style={{ maxWidth: '46ch' }}>
          {tipo ? 'Puede que el enlace esté mal escrito o que ya no esté en el catálogo.' : 'Revisa la dirección o sigue por el catálogo.'}
        </p>
        {sugerencias.length > 0 && (
          <>
            <h2 className="no-encontrado-t up">¿Buscabas alguno de estos?</h2>
            <ul className="no-encontrado-lista">
              {sugerencias.map((s) => (
                <li key={`${s.kit}-${s.id}`}>
                  <Link className="link up" to={s.kit ? rutaKit(s.id) : rutaPerfume(s.id)}>{s.nombre}</Link>
                </li>
              ))}
            </ul>
          </>
        )}
        <div className="no-encontrado-acciones">
          <Link className="btn up" to="/catalogo">Ver el catálogo</Link>
          <Link className="btn btn--line up" to="/">Ir al inicio</Link>
        </div>
      </div>
    </main>
  );
}
