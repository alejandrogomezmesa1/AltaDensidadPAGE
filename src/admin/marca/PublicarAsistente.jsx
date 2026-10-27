// Asistente para subir una publicación a Facebook Marketplace en un minuto:
// 1) fotos listas (se descargan o, en el celular, se comparten directo a Facebook),
// 2) abrir el formulario de Marketplace, 3) copiar título, precio y descripción en ese orden,
// 4) marcarla como publicada y pasar a la siguiente sugerida sin cerrar la ventana.
import { useEffect, useMemo, useState } from 'react';
import { apiJson } from '../../lib/api';
import { ModalAdmin, toastOk } from '../comunes';
import { copiarTexto, descargarBlob } from './utilidades';
import { fotosPublicacion } from './fotosMarketplace';
import { tituloDe, descripcionDe, tamano, pesos, GENERO } from './textosMarketplace';

const URL_CREAR = 'https://www.facebook.com/marketplace/create/item';
const CLAVE_FOTO = 'admin_marketplace_foto_real';

function leerFotoReal() {
  try { return localStorage.getItem(CLAVE_FOTO) === '1'; } catch { return false; }
}

export default function PublicarAsistente({ item, pie, onCerrar, onPublicado, onTexto, siguiente, onSiguiente, alerta }) {
  const { prod, t, pub } = item;
  const [fotoReal, setFotoReal] = useState(leerFotoReal);
  const [fotos, setFotos] = useState(null);
  const [errorFotos, setErrorFotos] = useState('');
  const [hechos, setHechos] = useState({});
  const [enlace, setEnlace] = useState(pub?.enlace || '');
  const [guardando, setGuardando] = useState(false);
  const [publicada, setPublicada] = useState(false);
  const [editando, setEditando] = useState(false);
  const [borrador, setBorrador] = useState({ nombre: t.nombre, gancho: t.gancho, sensacion: t.sensacion, ideal: t.ideal });

  const variante = pub ? pub.veces : 0;
  const titulo = tituloDe(t, prod, variante);
  const texto = descripcionDe(t, prod, pie);
  const precio = String(Math.round(Number(prod.price) || 0));
  const datosFoto = useMemo(() => ({
    nombre: t.nombre, genero: GENERO[prod.gender] || 'Unisex', ml: tamano(prod), familia: String(t.familia).split(' · ')[0],
    precio: pesos(prod.price), notas: t.notas, ideal: t.ideal, imagen: prod.image, semilla: prod.id
  }), [t, prod]);

  useEffect(() => {
    let vivo = true;
    let creadas = [];
    setFotos(null);
    setErrorFotos('');
    fotosPublicacion(datosFoto, { foto: fotoReal })
      .then((f) => { creadas = f; if (vivo) setFotos(f); else f.forEach((x) => URL.revokeObjectURL(x.url)); })
      .catch((e) => { if (vivo) setErrorFotos(e.message); });
    return () => { vivo = false; creadas.forEach((x) => URL.revokeObjectURL(x.url)); };
  }, [datosFoto, fotoReal]);

  const marcar = (clave) => setHechos((h) => ({ ...h, [clave]: true }));
  const copiar = async (clave, valor, aviso) => {
    await copiarTexto(valor);
    marcar(clave);
    toastOk(aviso);
  };
  const cambiarFoto = (v) => {
    setFotoReal(v);
    try { localStorage.setItem(CLAVE_FOTO, v ? '1' : '0'); } catch { /* sin almacenamiento */ }
  };

  const archivos = () => fotos.map((f) => new File([f.blob], f.nombre, { type: 'image/jpeg' }));
  const puedeCompartir = typeof navigator !== 'undefined' && navigator.canShare && fotos && navigator.canShare({ files: archivos() });
  const compartir = async () => {
    try {
      await navigator.share({ files: archivos(), title: titulo });
      marcar('fotos');
    } catch (e) {
      if (e.name !== 'AbortError') alerta('No se pudieron compartir las fotos: ' + e.message, 'error');
    }
  };
  const descargar = async () => {
    for (const f of fotos) {
      descargarBlob(f.blob, f.nombre);
      await new Promise((r) => setTimeout(r, 350)); // el navegador bloquea descargas simultáneas
    }
    marcar('fotos');
  };

  const publicar = async () => {
    setGuardando(true);
    try {
      const r = await apiJson(`admin/marketplace/publicaciones/${prod.id}`, { method: 'PUT', body: { accion: pub?.estado === 'publicada' ? 'renovar' : 'publicar', enlace: enlace.trim() || undefined } });
      onPublicado(prod.id, r.data);
      setPublicada(true);
      toastOk('Publicación registrada');
    } catch (e) {
      alerta(e.message, 'error');
    } finally {
      setGuardando(false);
    }
  };

  const guardarTexto = async (restablecer) => {
    try {
      if (restablecer) {
        await apiJson(`admin/marketplace/textos/${prod.id}`, { method: 'DELETE' });
        onTexto(prod.id, null);
      } else {
        const r = await apiJson(`admin/marketplace/textos/${prod.id}`, { method: 'PUT', body: borrador });
        onTexto(prod.id, r.data);
      }
      setEditando(false);
      toastOk(restablecer ? 'Texto base restablecido' : 'Texto guardado');
    } catch (e) {
      alerta(e.message, 'error');
    }
  };

  return (
    <ModalAdmin abierto titulo={publicada ? '¡Publicada!' : 'Publicar en Marketplace'} onCerrar={onCerrar}>
      <div className="marca-mpw">
        <div className="marca-mp-original" title="Solo para ti: no lo escribas en la publicación.">
          <span><i className="fas fa-lock" aria-hidden="true" /> ES EL 1.1 DE</span>
          <b>{prod.name}</b>
          {prod.brand?.name && <small>{prod.brand.name}</small>}
        </div>
        <header className="marca-mpw-cabeza">
          <div>
            <h3>{t.nombre}</h3>
            <p className="marca-mute">{GENERO[prod.gender] || 'Unisex'} · {tamano(prod)} · {t.familia}</p>
          </div>
          <b>{pesos(prod.price)}</b>
        </header>
        {t.automatico && (
          <p className="marca-mpw-aviso"><i className="fas fa-wand-magic-sparkles" aria-hidden="true" /> Texto automático armado con las notas del catálogo. Revísalo en «Editar texto» antes de publicar.</p>
        )}

        <ol className="marca-mpw-pasos">
          <li className={hechos.fotos ? 'hecho' : ''}>
            <div className="marca-mpw-paso"><span>1</span><b>Fotos</b>
              <div className="marca-segmento" role="group" aria-label="Portada">
                <button type="button" className={!fotoReal ? 'activo' : ''} onClick={() => cambiarFoto(false)}>Frasco Alta Densidad</button>
                <button type="button" className={fotoReal ? 'activo' : ''} onClick={() => cambiarFoto(true)} disabled={!prod.image}>Foto real</button>
              </div>
            </div>
            {fotoReal && <p className="marca-mute marca-mpw-nota">La foto real muestra el frasco original: si tiene el logo de otra marca, Marketplace puede bajar la publicación.</p>}
            <div className="marca-mpw-fotos">
              {fotos ? fotos.map((f) => <img key={f.nombre} src={f.url} alt={f.nombre} />)
                : errorFotos ? <p className="marca-mute">{errorFotos}</p>
                  : [0, 1, 2, 3].map((i) => <div key={i} className="marca-mpw-cargando" aria-hidden="true" />)}
            </div>
            <div className="marca-mp-acciones">
              {puedeCompartir && <button type="button" className="btn-primary" onClick={compartir}><i className="fas fa-share-nodes" /> Compartir a Facebook</button>}
              <button type="button" className={puedeCompartir ? 'btn-secondary' : 'btn-primary'} disabled={!fotos} onClick={descargar}><i className="fas fa-download" /> Descargar las 4 fotos</button>
            </div>
          </li>

          <li className={hechos.abrir ? 'hecho' : ''}>
            <div className="marca-mpw-paso"><span>2</span><b>Abre el formulario de Marketplace</b></div>
            <div className="marca-mp-acciones">
              <a className="btn-secondary" href={URL_CREAR} target="_blank" rel="noreferrer" onClick={() => marcar('abrir')}><i className="fab fa-facebook" /> Abrir Marketplace</a>
            </div>
            <p className="marca-mute marca-mpw-nota">Categoría: <b>Salud y belleza</b> · Estado: <b>Nuevo</b> · Ubicación: <b>Medellín</b></p>
          </li>

          <li className={hechos.titulo && hechos.precio && hechos.texto ? 'hecho' : ''}>
            <div className="marca-mpw-paso"><span>3</span><b>Copia y pega, en orden</b></div>
            <div className="marca-mpw-copias">
              <button type="button" className={hechos.titulo ? 'listo' : ''} onClick={() => copiar('titulo', titulo, 'Título copiado')}>
                <i className={hechos.titulo ? 'fas fa-check' : 'far fa-copy'} /><span><small>TÍTULO</small>{titulo}</span>
              </button>
              <button type="button" className={hechos.precio ? 'listo' : ''} onClick={() => copiar('precio', precio, 'Precio copiado')}>
                <i className={hechos.precio ? 'fas fa-check' : 'far fa-copy'} /><span><small>PRECIO</small>{precio}</span>
              </button>
              <button type="button" className={hechos.texto ? 'listo' : ''} onClick={() => copiar('texto', texto, 'Descripción copiada')}>
                <i className={hechos.texto ? 'fas fa-check' : 'far fa-copy'} /><span><small>DESCRIPCIÓN</small>{t.gancho}</span>
              </button>
            </div>
            {variante > 0 && <p className="marca-mute marca-mpw-nota">Ya la publicaste {variante} {variante === 1 ? 'vez' : 'veces'}: el título cambia para que Marketplace no la tome como repetida.</p>}
            <button type="button" className="marca-limpiar" onClick={() => setEditando(!editando)}>{editando ? 'Cerrar edición' : 'Editar texto'}</button>
            {editando && (
              <div className="marca-mpw-editar">
                {[['nombre', 'Nombre propio', 80], ['gancho', 'Gancho (primera línea)', 160], ['sensacion', 'Sensación', 200], ['ideal', 'Ideal para', 160]].map(([k, etq, max]) => (
                  <label key={k}><span className="marca-eyebrow">{etq.toUpperCase()}</span>
                    <input type="text" value={borrador[k]} maxLength={max} onChange={(e) => setBorrador({ ...borrador, [k]: e.target.value })} />
                  </label>
                ))}
                <p className="marca-mute marca-mpw-nota">No escribas el nombre ni la marca del original: Marketplace baja la publicación.</p>
                <div className="marca-mp-acciones">
                  <button type="button" className="btn-primary" onClick={() => guardarTexto(false)}>Guardar texto</button>
                  {t.editado && <button type="button" className="btn-secondary" onClick={() => guardarTexto(true)}>Volver al texto base</button>}
                </div>
              </div>
            )}
          </li>

          <li className={publicada ? 'hecho' : ''}>
            <div className="marca-mpw-paso"><span>4</span><b>{pub?.estado === 'publicada' ? '¿Ya la renovaste?' : '¿Ya quedó publicada?'}</b></div>
            <input type="url" className="marca-mpw-enlace" placeholder="Pega el enlace de la publicación (opcional)" value={enlace} onChange={(e) => setEnlace(e.target.value)} />
            <div className="marca-mp-acciones">
              {!publicada && (
                <button type="button" className="btn-primary" disabled={guardando} onClick={publicar}>
                  <i className="fas fa-check" /> {pub?.estado === 'publicada' ? 'Marcar como renovada' : 'Marcar como publicada'}
                </button>
              )}
              {publicada && siguiente && (
                <button type="button" className="btn-primary" onClick={onSiguiente}>Siguiente: {siguiente.t.nombre} <i className="fas fa-arrow-right" /></button>
              )}
              {publicada && <button type="button" className="btn-secondary" onClick={onCerrar}>Terminar</button>}
            </div>
          </li>
        </ol>
      </div>
    </ModalAdmin>
  );
}
