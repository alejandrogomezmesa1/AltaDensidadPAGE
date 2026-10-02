// Estado de la tienda compartido por todas las páginas públicas:
// catálogo (datos duros → API), bolsa persistida y capas abiertas (bolsa, detalle, kit, filtros, AURA).
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUbicacionReal } from '../lib/ubicacion';
import { pausarScrollSuave } from '../lib/scrollSuave';
import { DATOS_DUROS_PRODUCTOS, DATOS_DUROS_TOP10, DATOS_DUROS_ENVASES, DATOS_DUROS_KITS } from '../data/catalogo';
import { fetchConFallback } from '../lib/api';
import { adaptarProducto, normalizarImagen, pr, etiquetaTalla, noDisponible, LOGO, mapaSlugs, direccionPerfume, direccionKit, idDesdeRuta } from '../lib/producto';
import { leerArmado, precioArmado, leerInsumo, precioInsumo, ETIQUETA_TIPO } from '../lib/catalogo';

const CART_KEY = 'ad_cart_v2';
const LEGACY_CART_KEY = 'altadensidad_carrito';

const TiendaContext = createContext(null);
export const useTienda = () => useContext(TiendaContext);

const PRODUCTOS_INICIALES = DATOS_DUROS_PRODUCTOS.map(adaptarProducto);

function buscarEn(P, TOP10, id) {
  const n = Number(id);
  const p = P.find((x) => x.id === n);
  if (p) return p;
  // Si solo existe en el Top 10, se adapta al modelo del catálogo
  const t = TOP10.find((x) => Number(x.producto_id || x.id) === n);
  if (t) {
    return adaptarProducto({
      id: n, name: t.nombre, price: t.precio, image: t.imagen,
      category: t.categoria, gender: t.genero, description: t.descripcion,
      agotado: t.agotado, priceReview: t.precio_revision
    }, n);
  }
  return null;
}

function agregarLinea(cart, prod, id, ml, env, q) {
  if (prod && (noDisponible(prod) || prod.sp)) return cart;
  const i = cart.findIndex((x) => x.id === id && (x.ml || '') === (ml || '') && (x.env || '') === (env || ''));
  if (i >= 0) return cart.map((x, j) => (j === i ? { ...x, q: x.q + q } : x));
  return [...cart, { id, ml: ml || '', env: env || '', q }];
}

// Perfume armado (arm_…) o insumo (ins_…): el id ya describe la línea completa
function agregarPorId(cart, id, q) {
  if (cart.some((x) => x.id === id)) return cart.map((x) => (x.id === id ? { ...x, q: x.q + q } : x));
  return [...cart, { id, q }];
}

function agregarKit(cart, kit, q) {
  const cid = `kit_${kit.id}`;
  if (cart.some((x) => x.id === cid)) return cart.map((x) => (x.id === cid ? { ...x, q: x.q + q } : x));
  return [...cart, { id: cid, isKit: true, kitId: kit.id, q, precio: Number(kit.precio), n: kit.nombre, ml: 'Kit' }];
}

// Bolsa guardada + lo que se agregó con el carrito de la web anterior (altadensidad_carrito)
function cargarBolsa() {
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { cart = []; }
  if (!Array.isArray(cart)) cart = [];
  let legacy = [];
  try { legacy = JSON.parse(localStorage.getItem(LEGACY_CART_KEY) || '[]'); } catch { legacy = []; }
  if (Array.isArray(legacy) && legacy.length) {
    legacy.forEach((i) => {
      const q = Math.max(1, Number(i.cantidad) || 1);
      if (String(i.id).startsWith('kit_')) {
        const kitId = Number(String(i.id).replace('kit_', ''));
        cart = agregarKit(cart, { id: kitId, precio: Number(i.price) || 0, nombre: i.name }, q);
      } else {
        const p = buscarEn(PRODUCTOS_INICIALES, DATOS_DUROS_TOP10, i.id);
        cart = agregarLinea(cart, p, Number(i.id), p ? (p.sz[0] || '') : '', p ? (p.env[0] || '') : '', q);
      }
    });
    // Se guarda antes de borrar la bolsa vieja: la migración es idempotente
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      localStorage.removeItem(LEGACY_CART_KEY);
      localStorage.removeItem('ad_cart');
    } catch { /* sin almacenamiento */ }
  }
  return cart;
}

export function TiendaProvider({ children }) {
  const [P, setP] = useState(PRODUCTOS_INICIALES);
  const [TOP10, setTop10] = useState(DATOS_DUROS_TOP10);
  const [ENVASES, setEnvases] = useState(DATOS_DUROS_ENVASES);
  const [KITS, setKits] = useState(DATOS_DUROS_KITS);
  // Armador (envases, precios de esencia y feromonas) e insumos de DATA; null = aún sin cargar
  const [ARMADOR, setArmador] = useState(null);
  const [INSUMOS, setInsumos] = useState(null);
  const [cart, setCart] = useState(cargarBolsa);

  // Capa abierta: 'bolsa' | 'detalle' | 'kit' | 'filtros' | null
  const [capa, setCapa] = useState(null);
  // El catálogo de la API ya respondió (con o sin datos): antes, un enlace directo no se da por perdido
  const [catalogoListo, setCatalogoListo] = useState(false);
  const [kitsListos, setKitsListos] = useState(false);
  const navigate = useNavigate();
  const location = useUbicacionReal();
  const [paso, setPaso] = useState('bag');
  const [detalle, setDetalle] = useState({ id: null, ml: '', env: '', q: 1 });
  const [kitAbierto, setKitAbierto] = useState(null);
  const [auraAbierta, setAuraAbierta] = useState(false);

  // ── Carga desde el backend (en segundo plano; los datos duros ya están pintados) ──
  useEffect(() => {
    let vivo = true;
    fetchConFallback('productos').then((data) => {
      if (vivo) setCatalogoListo(true);
      if (!vivo || !data || !data.length) return;
      const nuevos = data.filter((x) => x.activo !== 0).map(adaptarProducto);
      if (nuevos.length) setP(nuevos);
    });
    fetchConFallback('top10').then((data) => {
      if (!vivo || !data || !data.length) return;
      setTop10(data.map((t, idx) => {
        return {
          posicion: t.posicion || idx + 1,
          producto_id: t.producto_id || t.id,
          id: t.producto_id || t.id,
          nombre: t.nombre || t.name,
          imagen: normalizarImagen(t.imagen || t.image),
          categoria: t.categoria || t.category || 'Perfumería',
          genero: t.genero || t.gender || 'Unisex',
          descripcion: t.descripcion || t.description || '',
          precio: Number(t.precio || t.price || 75000),
          rating: t.rating || 5,
          agotado: t.agotado ? 1 : 0,
          precio_revision: t.precio_revision ? 1 : 0
        };
      }));
    });
    fetchConFallback('envases').then((data) => {
      if (!vivo || !data || !data.length) return;
      // La base tiene envases repetidos (semilla ejecutada varias veces): uno por nombre
      const vistos = new Set();
      const unicos = data.filter((item) => {
        const clave = String(item.name || item.nombre || '').trim().toUpperCase();
        if (!clave || vistos.has(clave)) return false;
        vistos.add(clave);
        return true;
      });
      setEnvases(unicos.map((item, idx) => {
        const coincidencia = DATOS_DUROS_ENVASES.find((e) => e.name.toLowerCase() === (item.name || '').toLowerCase());
        const tallas = (Array.isArray(item.sizes) && item.sizes.length) ? item.sizes : (coincidencia ? coincidencia.sizes : ['30ml', '60ml']);
        return {
          id: item.id || idx + 1,
          name: item.name || item.nombre,
          image: normalizarImagen(item.image || item.imagen),
          material: item.material || 'Vidrio',
          sizes: tallas,
          description: item.description || item.descripcion || (coincidencia ? coincidencia.description : 'Envase de autor.')
        };
      }));
    });
    fetchConFallback('kits').then((data) => {
      if (vivo) setKitsListos(true);
      if (!vivo || !data || !data.length) return;
      setKits(data.map((k, idx) => ({
        id: k.id || idx + 1,
        nombre: k.nombre || k.name,
        imagen: normalizarImagen(k.imagen || k.image),
        descripcion: k.descripcion || k.description || '',
        precio: Number(k.precio || k.price || 60000),
        activo: k.activo !== undefined ? k.activo : 1,
        agotado: k.agotado ? 1 : 0,
        precio_revision: k.precio_revision ? 1 : 0,
        beneficios: k.beneficios || []
      })));
    });
    fetchConFallback('catalogo/armador', 6000).then((data) => {
      if (vivo) setArmador(data && Array.isArray(data.envases) ? data : { envases: [], esencia: {}, tamanos: [], recargoFeromonas: null, presentaciones: [] });
    });
    fetchConFallback('catalogo/insumos', 6000).then((data) => {
      if (vivo) setInsumos(Array.isArray(data) ? data : []);
    });
    return () => { vivo = false; };
  }, []);

  useEffect(() => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch { /* sin almacenamiento */ }
    if (!cart.length) setPaso('bag');
  }, [cart]);

  // Capas abiertas: bloquea el scroll y oculta los botones flotantes (body.ad-layer-open)
  useEffect(() => {
    if (!capa) return undefined;
    pausarScrollSuave(true);
    document.body.style.overflow = 'hidden';
    document.body.classList.add('ad-layer-open');
    return () => {
      document.body.style.overflow = '';
      pausarScrollSuave(false);
      document.body.classList.remove('ad-layer-open');
    };
  }, [capa]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') cerrarRef.current(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const buscarProducto = useCallback((id) => buscarEn(P, TOP10, id), [P, TOP10]);

  // Nombre, imagen, precio y detalle de una línea de la bolsa
  const resolverLinea = useCallback((l) => {
    if (l.isKit || String(l.id).startsWith('kit_')) {
      const kitId = l.kitId || Number(String(l.id).replace('kit_', ''));
      const kit = KITS.find((k) => k.id === kitId);
      return {
        apiId: 'kit_' + kitId,
        nom: kit ? kit.nombre : (l.n || 'Kit Especial'),
        img: kit ? normalizarImagen(kit.imagen) : LOGO,
        u: kit ? Number(kit.precio) : (l.precio || 60000),
        sub: 'Kit Exclusivo'
      };
    }
    const armado = leerArmado(l.id);
    if (armado) {
      const p = buscarEn(P, TOP10, armado.productoId);
      const envase = ARMADOR && ARMADOR.envases.find((e) => e.id === armado.envaseId);
      const precio = ARMADOR && p ? precioArmado(ARMADOR, { categoria: p.c, ml: armado.ml, envaseId: armado.envaseId, feromonas: armado.feromonas }) : null;
      return {
        apiId: l.id,
        nom: p ? p.n : 'Perfume preparado',
        img: envase ? normalizarImagen(envase.image) : (p ? p.img : LOGO),
        u: precio ? precio.total : 0,
        sub: ['Preparado', envase && envase.name, `${armado.ml} ml`, armado.feromonas ? 'con feromonas' : 'sin feromonas'].filter(Boolean).join(' · ')
      };
    }
    const insumo = leerInsumo(l.id);
    if (insumo) {
      const i = INSUMOS && INSUMOS.find((x) => x.id === insumo.id);
      return {
        apiId: l.id,
        nom: i ? i.name : 'Insumo',
        img: i ? normalizarImagen(i.image) : LOGO,
        u: i ? precioInsumo(i, insumo.ml) : 0,
        sub: [i ? ETIQUETA_TIPO[i.type] : 'Insumo', insumo.ml && `${insumo.ml} ml`].filter(Boolean).join(' · ')
      };
    }
    const p = buscarEn(P, TOP10, l.id);
    return {
      apiId: String(l.id),
      nom: p ? p.n : 'Fragancia',
      img: p ? p.img : LOGO,
      u: p ? pr(p) : 75000,
      sub: [etiquetaTalla(l.ml), l.env].filter(Boolean).join(' · ') || 'Fragancia'
    };
  }, [P, TOP10, KITS, ARMADOR, INSUMOS]);

  const abrirBolsa = useCallback(() => { setPaso('bag'); setCapa('bolsa'); }, []);
  // ── Enlaces directos de perfumes y kits ──
  // Abrir una ficha desde la tienda navega a /perfume/<slug> guardando la página de fondo
  // (state.fondo): la ficha se ve como ventana sobre esa página y "atrás" la cierra. Entrar
  // directo por el enlace (sin fondo) muestra la ficha como página (FichaPagina).
  const slugsP = useMemo(() => mapaSlugs(P, (p) => p.n), [P]);
  const slugsK = useMemo(() => mapaSlugs(KITS.filter((k) => k.activo !== 0), (k) => k.nombre), [KITS]);
  // slugsP/slugsK: enlaces del formato anterior (/perfume/<nombre>), que siguen funcionando
  const rutaPerfume = useCallback((id) => {
    const p = buscarEn(P, TOP10, id);
    return p ? direccionPerfume(p) : `/perfume/${id}`;
  }, [P, TOP10]);
  const rutaKit = useCallback((id) => {
    const k = KITS.find((x) => x.id === Number(id));
    return k ? direccionKit(k) : `/kit/${id}`;
  }, [KITS]);
  const idPorSlug = useCallback((tipo, ruta) => (tipo === 'kit'
    ? idDesdeRuta(ruta, slugsK, (id) => KITS.some((k) => k.id === id && k.activo !== 0))
    : idDesdeRuta(ruta, slugsP, (id) => Boolean(buscarEn(P, TOP10, id)))), [slugsP, slugsK, P, TOP10, KITS]);
  const fondo = location.state && location.state.fondo;
  const enFicha = /^\/(perfume|kit)\/.+/.test(location.pathname);

  const cerrarCapas = useCallback(() => {
    if (fondo && enFicha) navigate(-1);
    else setCapa(null);
  }, [fondo, enFicha, navigate]);
  const cerrarRef = useRef(cerrarCapas);
  cerrarRef.current = cerrarCapas;

  const addToCart = useCallback((id, ml, env, q = 1) => {
    const prod = buscarEn(P, TOP10, id);
    setCart((c) => agregarLinea(c, prod, Number(id), ml, env, q));
  }, [P, TOP10]);

  // Añadir desde tarjeta, Top 10 o AURA: primera presentación y envase del producto
  const agregarRapido = useCallback((id) => {
    if (String(id).startsWith('kit_')) {
      const kit = KITS.find((k) => k.id === Number(String(id).replace('kit_', '')));
      if (kit && !kit.agotado && !kit.precio_revision) setCart((c) => agregarKit(c, kit, 1));
    } else {
      const p = buscarEn(P, TOP10, id);
      if (p) setCart((c) => agregarLinea(c, p, p.id, p.sz[0] || '', p.env[0] || '', 1));
    }
    abrirBolsa();
  }, [P, TOP10, KITS, abrirBolsa]);

  const addKitToCart = useCallback((kitId, q = 1) => {
    const kit = KITS.find((k) => k.id === Number(kitId));
    if (!kit || kit.agotado || kit.precio_revision) return;
    setCart((c) => agregarKit(c, kit, q));
  }, [KITS]);

  // Perfume armado o insumo: la línea se identifica solo por su id (arm_… / ins_…)
  const agregarPorCodigo = useCallback((id, q = 1) => {
    setCart((c) => agregarPorId(c, id, q));
    abrirBolsa();
  }, [abrirBolsa]);

  const cambiarCantidad = useCallback((i, delta) => {
    setCart((c) => c.map((x, j) => (j === i ? { ...x, q: x.q + delta } : x)).filter((x) => x.q >= 1));
  }, []);
  const quitarLinea = useCallback((i) => setCart((c) => c.filter((_, j) => j !== i)), []);
  const vaciarBolsa = useCallback(() => setCart([]), []);

  const abrirDetalle = useCallback((id) => {
    const p = buscarEn(P, TOP10, id);
    if (!p) return;
    navigate(rutaPerfume(p.id), { state: { fondo: fondo || location }, replace: Boolean(fondo) });
  }, [P, TOP10, navigate, rutaPerfume, fondo, location]);

  const abrirKit = useCallback((kitId) => {
    const kit = KITS.find((k) => k.id === Number(kitId) || `kit_${k.id}` === String(kitId));
    if (!kit) return;
    navigate(rutaKit(kit.id), { state: { fondo: fondo || location }, replace: Boolean(fondo) });
  }, [KITS, navigate, rutaKit, fondo, location]);

  // La URL manda: con fondo, la ficha se abre como ventana; al salir de la ficha, se cierra
  useEffect(() => {
    const m = /^\/(perfume|kit)\/(.+?)\/?$/.exec(location.pathname);
    if (m && fondo) {
      const id = idPorSlug(m[1], m[2]);
      if (!id) return;
      if (m[1] === 'perfume') {
        const p = buscarEn(P, TOP10, id);
        if (!p) return;
        setDetalle((d) => (d.id === p.id ? d : { id: p.id, ml: p.sz[0] || '', env: p.env[0] || '', q: 1 }));
        setCapa('detalle');
      } else {
        setKitAbierto(id);
        setCapa('kit');
      }
    } else {
      setCapa((c) => (c === 'detalle' || c === 'kit' ? null : c));
    }
  }, [location, fondo, idPorSlug, P, TOP10]);

  const pedirAura = useCallback(() => { setCapa(null); setAuraAbierta(true); }, []);

  const valor = useMemo(() => ({
    P, TOP10, ENVASES, KITS, ARMADOR, INSUMOS, cart, agregarPorCodigo,
    capa, setCapa, paso, setPaso, detalle, setDetalle, kitAbierto, setKitAbierto, auraAbierta, setAuraAbierta,
    catalogoListo, kitsListos, rutaPerfume, rutaKit, idPorSlug,
    buscarProducto, resolverLinea, abrirBolsa, cerrarCapas, addToCart, agregarRapido, addKitToCart,
    cambiarCantidad, quitarLinea, vaciarBolsa, abrirDetalle, abrirKit, pedirAura
  }), [P, TOP10, ENVASES, KITS, ARMADOR, INSUMOS, cart, agregarPorCodigo, capa, paso, detalle, kitAbierto, auraAbierta,
    catalogoListo, kitsListos, rutaPerfume, rutaKit, idPorSlug,
    buscarProducto, resolverLinea, abrirBolsa, cerrarCapas, addToCart, agregarRapido, addKitToCart,
    cambiarCantidad, quitarLinea, vaciarBolsa, abrirDetalle, abrirKit, pedirAura]);

  return <TiendaContext.Provider value={valor}>{children}</TiendaContext.Provider>;
}
