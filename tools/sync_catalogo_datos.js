const fs = require('fs');
const path = require('path');

const datosPath = '/tmp/datos_completos.json';
if (!fs.existsSync(datosPath)) {
    console.error('No se encontró ' + datosPath);
    process.exit(1);
}

const { prods, top10, envases } = JSON.parse(fs.readFileSync(datosPath, 'utf8'));

// ============================================================
// 1. GENERAR ASSETS/JS/HAUTE-PARFUMERIE.JS
// ============================================================
const hauteCode = `/**
 * HAUTE PARFUMERIE — Alta Densidad
 * Arquitectura de Autor: Bolsa reactiva, buscador en vivo, atelier de filtros olfativos,
 * ranking Top 10 oficial, catálogo de envases de lujo, integración resiliente con backend Railway.
 */
(function() {
  "use strict";

  const WA = "573046477694";
  const SIZES = [
    { ml: 30, x: 0.6, s: 1.3, n: "Viaje", t: "Atomizador compacto para llevar contigo." },
    { ml: 50, x: 1.0, s: 1.7, n: "Insignia", t: "El formato de la casa, para el uso diario." },
    { ml: 100, x: 1.8, s: 2.1, n: "Colección", t: "Botella grande para quienes no quieren quedarse sin ella." }
  ];

  // ============================================================
  // DATOS DUROS DEL CATÁLOGO REAL DE FRAGANCIAS DE ALTA DENSIDAD
  // ============================================================
  const DATOS_DUROS_PRODUCTOS = ${JSON.stringify(prods, null, 2)};

  // ============================================================
  // DATOS DUROS: TOP 10 PERFUMES MÁS VENDIDOS
  // ============================================================
  const DATOS_DUROS_TOP10 = ${JSON.stringify(top10, null, 2)};

  // ============================================================
  // DATOS DUROS: CATÁLOGO DE PRESENTACIONES Y ENVASES DE AUTOR
  // ============================================================
  const DATOS_DUROS_ENVASES = ${JSON.stringify(envases, null, 2)};

  // Estados reactivos en memoria
  let P = [...DATOS_DUROS_PRODUCTOS];
  let TOP10 = [...DATOS_DUROS_TOP10];
  let ENVASES = [...DATOS_DUROS_ENVASES];

  const $ = function(s) { return document.querySelector(s); };
  const $$ = function(s) { return document.querySelectorAll(s); };
  const fmt = function(n) { return "$" + Number(n).toLocaleString("es-CO"); };

  // Normalizador universal de imágenes para rutas locales y remotas
  function normalizarImagen(src) {
    if (!src) return "assets/img/Logo2026.png";
    if (src.startsWith("http://") || src.startsWith("https://")) return src;
    let p = src.trim();
    if (p.startsWith("img/")) {
      p = "assets/" + p;
    } else if (!p.startsWith("assets/")) {
      p = "assets/img/" + p;
    }
    return p
      .replace(/cartier\\.jpeg$/i, "CARTIER.jpeg")
      .replace(/cilindro\\.jpeg$/i, "CILINDRO.jpeg")
      .replace(/amira\\.jpeg$/i, "AMIRA.jpeg")
      .replace(/victory\\.jpeg$/i, "VICTORY.jpeg")
      .replace(/eros\\.jpeg$/i, "EROS.jpeg");
  }

  // Filtros activos
  let filters = {
    search: "",
    occasion: "Todos",
    family: "Todos",
    gender: "Todos"
  };

  // Carrito y selección
  let cart = [];
  let D = { id: P[0] ? P[0].id : 1, ml: 50, q: 1 };

  try {
    cart = JSON.parse(localStorage.getItem("ad_cart") || "[]");
  } catch(e) {
    cart = [];
  }

  function save() {
    try {
      localStorage.setItem("ad_cart", JSON.stringify(cart));
    } catch(e) {}
  }

  function sz(ml) {
    return SIZES.filter(function(z) { return z.ml === ml; })[0] || SIZES[1];
  }

  function pr(p, ml) {
    const baseP = Number(p.p || p.precio || p.price || 75000);
    return Math.round((baseP * sz(ml).x) / 1000) * 1000;
  }

  function bt(h, s, img, name) {
    if (img) {
      const realImg = normalizarImagen(img);
      return \`
        <div class="bottle-wrap">
          <img src="\${realImg}" alt="\${name || 'Fragancia'}" class="stage-real-img" loading="lazy" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='grid';">
          <div class="bottle fallback-bottle" style="--h:\${h || 32};--s:\${s || 1.7};display:none"><i></i></div>
        </div>
      \`;
    }
    return \`<div class="bottle" style="--h:\${h || 32};--s:\${s || 1.7}"><i></i></div>\`;
  }

  function desc(p) {
    if (p.desc) return p.desc;
    if (p.description) return p.description;
    const f = (p.f || "de autor").toLowerCase();
    const no = p.no || ["Notas cítricas", "Corazón aromático", "Ámbar y feromonas"];
    return \`Una fragancia \${f} de alta densidad. Abre con \${no[0].toLowerCase()}, se asienta en \${no[1].toLowerCase()} y deja un fondo memorable de \${no[2].toLowerCase()}. Concentración extra al 33% con base de feromonas.\`;
  }

  function normalizar(txt) {
    return (txt || "").toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").trim();
  }

  function filtrarProductos() {
    const term = normalizar(filters.search);
    return P.filter(function(p) {
      if (term) {
        const enNombre = normalizar(p.n).includes(term);
        const enFamilia = normalizar(p.f).includes(term);
        const enOcasion = normalizar(p.o).includes(term);
        const enNotas = p.no && p.no.some(n => normalizar(n).includes(term));
        const enDesc = p.desc ? normalizar(p.desc).includes(term) : false;
        if (!enNombre && !enFamilia && !enOcasion && !enNotas && !enDesc) return false;
      }

      if (filters.occasion !== "Todos") {
        if (p.o !== filters.occasion) return false;
      }

      if (filters.family !== "Todos") {
        if (p.f !== filters.family) return false;
      }

      if (filters.gender !== "Todos") {
        if (p.g !== filters.gender) return false;
      }

      return true;
    });
  }

  function getActiveFilterCount() {
    let count = 0;
    if (filters.occasion !== "Todos") count++;
    if (filters.family !== "Todos") count++;
    if (filters.gender !== "Todos") count++;
    if (filters.search) count++;
    return count;
  }

  function updateFilterBadge() {
    const badge = $("#filterCountBadge");
    if (!badge) return;
    const count = getActiveFilterCount();
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = "inline-block";
    } else {
      badge.style.display = "none";
    }
  }

  function renderChips() {
    const el = $("#chips");
    if (!el) return;
    const ocasiones = ["Todos", "Noche", "Oficina", "Verano"];
    el.innerHTML = ocasiones.map(function(x) {
      return \`<button class="chip up \${x === filters.occasion ? 'on' : ''}" data-f="\${x}">\${x}</button>\`;
    }).join("");
  }

  function renderGrid() {
    const el = $("#grid");
    const statusEl = $("#filterStatus");
    const metaEl = $("#coleccionMeta");
    if (!el) return;

    const filtrados = filtrarProductos();

    if (statusEl) {
      const activeCount = getActiveFilterCount();
      if (activeCount > 0) {
        statusEl.style.display = "flex";
        statusEl.innerHTML = \`
          <span>Mostrando <b>\${filtrados.length}</b> de \${P.length} fragancias</span>
          <button class="link up" id="btnResetInline" style="font-size:var(--fs-2)">Limpiar filtros</button>
        \`;
      } else {
        statusEl.style.display = "none";
      }
    }

    if (metaEl) {
      metaEl.textContent = \`\${P.length} formulaciones · 33% de extracto puro · Base de feromonas\`;
    }

    updateFilterBadge();

    if (!filtrados.length) {
      el.innerHTML = \`
        <div style="grid-column: 1 / -1; padding: var(--sp-6) var(--sp-4); text-align: center; background: var(--c-bg);">
          <p class="mute" style="font-size: var(--fs-4); font-family: var(--f-display); margin-bottom: var(--sp-3);">
            No encontramos ninguna fragancia que coincida con estos criterios.
          </p>
          <button class="btn btn--line up" id="btnResetEmpty">Ver toda la colección</button>
        </div>
      \`;
      return;
    }

    el.innerHTML = filtrados.map(function(p) {
      return \`
        <article class="card">
          <div class="stage" data-open="\${p.id}">
            <span class="tag up">33% extracto</span>
            \${bt(p.h, 1, p.img, p.n)}
            <div class="notes">\${(p.no || []).join(" · ")}</div>
          </div>
          <div class="info">
            <div>
              <h3 data-open="\${p.id}">\${p.n}</h3>
              <span>\${p.f} · desde \${fmt(pr(p, 30))}</span>
            </div>
            <button class="link up" data-add="\${p.id}">Añadir</button>
          </div>
        </article>
      \`;
    }).join("");
  }

  function renderRank() {
    const el = $("#rank");
    if (!el) return;
    el.innerHTML = TOP10.map(function(p, i) {
      const pId = p.producto_id || p.id;
      const nom = p.nombre || p.name || p.n;
      const fam = p.f || p.categoria || p.category || "Perfumería de Autor";
      const notas = p.no ? p.no.join(" · ") : (p.genero || p.gender || "Unisex");
      const precio = p.precio || p.price || p.p || 75000;
      return \`
        <div class="row rv">
          <span class="n">\${i < 9 ? "0" : ""}\${i + 1}</span>
          <div>
            <h3 data-open="\${pId}">\${nom}</h3>
            <small>\${fam} · \${notas}</small>
          </div>
          <span class="pr">\${fmt(precio)}</span>
          <button class="link up" data-open="\${pId}">Ver</button>
        </div>
      \`;
    }).join("");
  }

  function renderSizes() {
    const el = $("#sizes");
    if (!el) return;
    el.innerHTML = ENVASES.map(function(z) {
      const imgPath = normalizarImagen(z.image || z.imagen);
      const tallas = Array.isArray(z.sizes) && z.sizes.length ? z.sizes.join(" · ") : (z.talla || "30ml · 60ml");
      const nom = z.name || z.nombre;
      const msgWa = encodeURIComponent("¡Hola! Me gustaría pedir mi perfume en el envase " + nom + " de Alta Densidad. ✨");
      return \`
        <div class="size rv">
          <div class="stage" style="padding:var(--sp-2);">
            <img src="\${imgPath}" alt="Envase \${nom}" class="stage-real-img" style="max-height:200px; width:auto; max-width:85%; object-fit:contain;" loading="lazy" onerror="this.src='assets/img/Logo2026.png';">
          </div>
          <b style="font-size:22px; margin-top:var(--sp-1); letter-spacing:0.04em;">\${nom}</b>
          <span class="up eyebrow">\${tallas} · \${z.material || 'Vidrio'}</span>
          <p class="mute" style="font-size:var(--fs-2); line-height:1.45; max-width:28ch; margin:var(--sp-1) 0 var(--sp-2);">\${z.description || z.descripcion || 'Envase de vidrio premium.'}</p>
          <a class="btn btn--line up" style="font-size:11px; padding:var(--sp-2) var(--sp-3);" href="https://wa.me/\${WA}?text=\${msgWa}" target="_blank" rel="noopener">Pedir en este envase</a>
        </div>
      \`;
    }).join("");
  }

  function renderDetail() {
    const sheet = $("#sheet");
    if (!sheet) return;
    const p = P.find(item => item.id === D.id) ||
              TOP10.find(item => (item.id === D.id || item.producto_id === D.id)) ||
              P[0];
    const z = sz(D.ml);
    const nom = p.n || p.nombre || p.name;
    const fam = p.f || p.categoria || p.category || "Perfumería de Autor";
    const occ = p.o || "Noche";
    const imgUrl = p.img || p.imagen || p.image;
    const notas = p.no || ["Notas cítricas", "Corazón aromático", "Ámbar y feromonas"];

    sheet.innerHTML = \`
      <button class="x up" data-close aria-label="Cerrar detalle">✕ Cerrar</button>
      <div class="stage">\${bt(p.h || 32, z.s + 0.3, imgUrl, nom)}</div>
      <div class="d-info">
        <span class="up eyebrow">\${fam} · Ocasión: \${occ}</span>
        <h2>\${nom}</h2>
        <p class="mute">\${desc(p)}</p>
        <dl class="pyr">
          <div><dt class="up">Salida</dt><dd>\${notas[0] || 'Notas frescas'}</dd></div>
          <div><dt class="up">Corazón</dt><dd>\${notas[1] || 'Esencia de autor'}</dd></div>
          <div><dt class="up">Fondo</dt><dd>\${notas[2] || 'Ámbar y feromonas'}</dd></div>
        </dl>
        <div class="specs up">
          <div><b>33%</b>Extracto</div>
          <div><b>12h+</b>Fijación</div>
          <div><b>+</b>Feromonas</div>
        </div>
        <div class="pick up">
          \${SIZES.map(s => \`
            <button class="chip \${s.ml === D.ml ? 'on' : ''}" data-size="\${s.ml}">\${s.ml} ml</button>
          \`).join("")}
        </div>
        <div class="buy">
          <b style="font:300 28px var(--f-display)">\${fmt(pr(p, D.ml) * D.q)}</b>
          <div class="qty">
            <button data-dq="-1" aria-label="Disminuir">−</button>
            <span>\${D.q}</span>
            <button data-dq="1" aria-label="Aumentar">+</button>
          </div>
          <button class="btn up" data-adddet>Añadir a la bolsa</button>
        </div>
      </div>
    \`;
  }

  function populateFilterModal() {
    const fpFamilies = $("#fpFamilies");
    const fpOccasions = $("#fpOccasions");
    const fpGenders = $("#fpGenders");

    if (!fpFamilies || !fpOccasions || !fpGenders) return;

    const familias = ["Todos", ...new Set(P.map(x => x.f).filter(Boolean))];
    fpFamilies.innerHTML = familias.map(f => \`
      <button class="chip up \${filters.family === f ? 'on' : ''}" data-modal-filter="family" data-val="\${f}">\${f}</button>
    \`).join("");

    const ocasiones = ["Todos", "Noche", "Oficina", "Verano"];
    fpOccasions.innerHTML = ocasiones.map(o => \`
      <button class="chip up \${filters.occasion === o ? 'on' : ''}" data-modal-filter="occasion" data-val="\${o}">\${o}</button>
    \`).join("");

    const generos = ["Todos", "Unisex", "Masculino", "Femenino"];
    fpGenders.innerHTML = generos.map(g => \`
      <button class="chip up \${filters.gender === g ? 'on' : ''}" data-modal-filter="gender" data-val="\${g}">\${g}</button>
    \`).join("");

    updateFilterModalMatchingCount();
  }

  function updateFilterModalMatchingCount() {
    const countEl = $("#filterMatchingCount");
    if (!countEl) return;
    const matches = filtrarProductos().length;
    countEl.textContent = matches;
  }

  function openFilterModal() {
    populateFilterModal();
    const modal = $("#filterModal");
    const scrim = $("#scrim");
    if (modal) modal.classList.add("on");
    if (scrim) scrim.classList.add("on");
    document.body.style.overflow = "hidden";
  }

  function closeFilterModal() {
    const modal = $("#filterModal");
    const scrim = $("#scrim");
    if (modal) modal.classList.remove("on");
    if (scrim) scrim.classList.remove("on");
    document.body.style.overflow = "";
  }

  function resetAllFilters() {
    filters = {
      search: "",
      occasion: "Todos",
      family: "Todos",
      gender: "Todos"
    };
    const searchInput = $("#liveSearch");
    const clearBtn = $("#clearSearch");
    if (searchInput) searchInput.value = "";
    if (clearBtn) clearBtn.style.display = "none";
    renderChips();
    renderGrid();
    updateFilterBadge();
  }

  // Carrito / Bolsa
  function addToCart(id, ml, q) {
    const item = cart.find(x => x.id === id && x.ml === ml);
    if (item) {
      item.q += q;
    } else {
      cart.push({ id, ml, q });
    }
    save();
    drawCart();
  }

  function drawCart() {
    const itemsEl = $("#items");
    const totalEl = $("#total");
    const cntEl = $("#cnt");
    if (!itemsEl) return;

    let t = 0;
    let c = 0;

    if (cart.length) {
      itemsEl.innerHTML = cart.map((l, i) => {
        const p = P.find(item => item.id === l.id) ||
                  TOP10.find(item => (item.id === l.id || item.producto_id === l.id)) ||
                  { n: "Fragancia", p: 75000, h: 30 };
        const nom = p.n || p.nombre || p.name;
        const u = pr(p, l.ml);
        t += u * l.q;
        c += l.q;
        return \`
          <div class="it">
            <div class="mini" style="--h:\${p.h || 30}"></div>
            <div>
              <b class="up">\${nom}</b>
              <small>\${l.ml} ml · \${fmt(u)}</small>
              <div class="qty" style="margin-top:var(--sp-2)">
                <button data-cq="-1" data-i="\${i}">−</button>
                <span>\${l.q}</span>
                <button data-cq="1" data-i="\${i}">+</button>
              </div>
            </div>
            <div>\${fmt(u * l.q)}</div>
          </div>
        \`;
      }).join("");
    } else {
      itemsEl.innerHTML = \`
        <div class="empty">
          <p>Tu bolsa está vacía.</p>
          <p style="margin-top:var(--sp-3)"><a class="link up" href="#coleccion" data-close>Ver colección</a></p>
        </div>
      \`;
    }

    if (totalEl) totalEl.textContent = fmt(t);
    if (cntEl) cntEl.textContent = c;

    const waBtn = $("#wa");
    if (waBtn) {
      const msg = "¡Hola! Quiero hacer un pedido en Fragancias de Alta Densidad:\\n\\n" +
        cart.map(l => {
          const p = P.find(item => item.id === l.id) ||
                    TOP10.find(item => (item.id === l.id || item.producto_id === l.id)) ||
                    { n: "Fragancia" };
          const nom = p.n || p.nombre || p.name;
          return \`• \${l.q} x \${nom} (\${l.ml} ml) = \${fmt(pr(p, l.ml) * l.q)}\`;
        }).join("\\n") +
        \`\\n\\nTotal: \${fmt(t)}\\n¿Me confirman disponibilidad y despacho? ✨\`;

      waBtn.href = cart.length ? \`https://wa.me/\${WA}?text=\${encodeURIComponent(msg)}\` : "#";
      waBtn.style.opacity = cart.length ? "1" : "0.4";
      waBtn.style.pointerEvents = cart.length ? "auto" : "none";
    }
  }

  function closeAll() {
    const drawer = $("#drawer");
    const modal = $("#modal");
    const filterModal = $("#filterModal");
    const scrim = $("#scrim");
    if (drawer) drawer.classList.remove("on");
    if (modal) modal.classList.remove("on");
    if (filterModal) filterModal.classList.remove("on");
    if (scrim) scrim.classList.remove("on");
    document.body.style.overflow = "";
  }

  function openCart() {
    const modal = $("#modal");
    const filterModal = $("#filterModal");
    const drawer = $("#drawer");
    const scrim = $("#scrim");
    if (modal) modal.classList.remove("on");
    if (filterModal) filterModal.classList.remove("on");
    if (drawer) drawer.classList.add("on");
    if (scrim) scrim.classList.add("on");
    document.body.style.overflow = "hidden";
  }

  function openDet(id) {
    D = { id: Number(id), ml: 50, q: 1 };
    renderDetail();
    const modal = $("#modal");
    const scrim = $("#scrim");
    if (modal) modal.classList.add("on");
    if (scrim) scrim.classList.add("on");
    document.body.style.overflow = "hidden";
  }

  // Fetch seguro con fallback multiruta (localhost -> Railway)
  async function fetchConFallback(rutaApi) {
    const urls = [
      \`http://localhost:3000/api/\${rutaApi}\`,
      \`https://altadensidadpage-production.up.railway.app/api/\${rutaApi}\`
    ];
    for (const url of urls) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);
        const resp = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        if (resp.ok) {
          const json = await resp.json();
          if (json.success && json.data) return json.data;
          if (Array.isArray(json)) return json;
        }
      } catch(e) {}
    }
    return null;
  }

  // Carga reactiva de productos desde API
  async function cargarCatalogoBackend() {
    try {
      const data = await fetchConFallback("productos");
      if (data && data.length) {
        const activos = data.filter(x => x.activo !== 0);
        if (activos.length) {
          adaptarYRenderizar(activos);
          try { localStorage.setItem("ad_cached_products_v1", JSON.stringify(activos)); } catch(e) {}
        }
      }
    } catch(e) {}
  }

  // Carga reactiva del ranking Top 10 desde API
  async function cargarTop10Backend() {
    try {
      const data = await fetchConFallback("top10");
      if (data && data.length) {
        TOP10 = data.map((t, idx) => ({
          posicion: t.posicion || idx + 1,
          producto_id: t.producto_id || t.id,
          id: t.producto_id || t.id,
          nombre: t.nombre || t.name,
          imagen: normalizarImagen(t.imagen || t.image),
          categoria: t.categoria || t.category || "Perfumería",
          genero: t.genero || t.gender || "Unisex",
          f: t.categoria || "Perfumería de Autor",
          descripcion: t.descripcion || t.description || "",
          precio: Number(t.precio || t.price || 75000),
          rating: t.rating || 5
        }));
        renderRank();
        try { localStorage.setItem("ad_cached_top10_v1", JSON.stringify(TOP10)); } catch(e) {}
      }
    } catch(e) {}
  }

  // Carga reactiva de envases desde API
  async function cargarEnvasesBackend() {
    try {
      const data = await fetchConFallback("envases");
      if (data && data.length) {
        ENVASES = data.map((item, idx) => {
          const coincidencia = DATOS_DUROS_ENVASES.find(e => e.name.toLowerCase() === (item.name || "").toLowerCase());
          const tallasReales = (Array.isArray(item.sizes) && item.sizes.length)
            ? item.sizes
            : (coincidencia ? coincidencia.sizes : ["30ml", "60ml"]);
          return {
            id: item.id || idx + 1,
            name: item.name || item.nombre,
            image: normalizarImagen(item.image || item.imagen),
            material: item.material || "Vidrio",
            sizes: tallasReales,
            description: item.description || item.descripcion || (coincidencia ? coincidencia.description : "Envase de autor.")
          };
        });
        renderSizes();
        try { localStorage.setItem("ad_cached_envases_v1", JSON.stringify(ENVASES)); } catch(e) {}
      }
    } catch(e) {}
  }

  function adaptarYRenderizar(lista) {
    const nuevos = lista.map((item, idx) => {
      let occ = "Noche";
      let fam = "Amaderada";
      let gen = "Unisex";
      let hue = (idx * 37) % 360;

      const nameLow = (item.name || "").toLowerCase();
      const descLow = (item.description || "").toLowerCase();
      const catLow = (item.category || "").toLowerCase();

      if (item.gender) {
        gen = (item.gender === "Hombre" || item.gender === "Masculino") ? "Masculino" :
              ((item.gender === "Mujer" || item.gender === "Femenino") ? "Femenino" : "Unisex");
      } else if (descLow.includes("femenin") || nameLow.includes("rose") || nameLow.includes("mujer")) {
        gen = "Femenino";
      } else if (descLow.includes("masculin") || nameLow.includes("hombre")) {
        gen = "Masculino";
      }

      if (descLow.includes("fresc") || descLow.includes("cítric") || descLow.includes("verano") || nameLow.includes("aqua") || nameLow.includes("blue")) {
        occ = "Verano";
        fam = "Cítrica / Fresca";
        hue = 190;
      } else if (descLow.includes("oficina") || descLow.includes("elegante") || descLow.includes("diario") || descLow.includes("versátil")) {
        occ = "Oficina";
        fam = "Aromática";
        hue = 130;
      } else if (descLow.includes("dulce") || descLow.includes("vainilla") || descLow.includes("gourmand") || descLow.includes("caramelo") || nameLow.includes("candy")) {
        fam = "Dulce / Gourmand";
        hue = 24;
      } else if (descLow.includes("floral") || nameLow.includes("rosa") || nameLow.includes("iris") || nameLow.includes("rose")) {
        fam = "Floral";
        hue = 330;
      } else if (descLow.includes("cuero") || nameLow.includes("cuero") || nameLow.includes("leather")) {
        fam = "Cuero";
        hue = 16;
      } else if (catLow.includes("arabe") || descLow.includes("oriental") || descLow.includes("especiad") || nameLow.includes("oud")) {
        fam = "Especiada / Árabe";
        hue = 40;
      }

      const notasExtraidas = [
        item.notas_salida || "Salida vibrante",
        item.notas_corazon || "Corazón de autor",
        item.notas_fondo || "Ámbar y feromonas"
      ];

      return {
        id: item.id || (1000 + idx),
        n: item.name,
        f: fam,
        o: occ,
        g: gen,
        no: notasExtraidas,
        p: Number(item.price) > 0 ? Number(item.price) : 75000,
        h: hue,
        desc: item.description || null,
        img: normalizarImagen(item.image || (item.images && item.images[0]))
      };
    });

    if (nuevos.length) {
      P = nuevos;
      renderChips();
      renderGrid();
    }
  }

  // Micro-interacción: Botella 3D en Hero
  function initHeroBottleInteractivity() {
    const stage = document.querySelector(".hero .stage");
    const bottle = document.querySelector(".hero .stage .bottle");
    if (!stage || !bottle) return;

    stage.addEventListener("mousemove", function(e) {
      const rect = stage.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      bottle.style.transform = \`perspective(600px) rotateY(\${x * 16}deg) rotateX(\${-y * 16}deg) translateY(-8px)\`;
    });

    stage.addEventListener("mouseleave", function() {
      bottle.style.transform = "";
    });

    stage.addEventListener("click", function() {
      let currentHue = parseInt(bottle.style.getPropertyValue("--h") || "32", 10);
      let nextHue = (currentHue + 45) % 360;
      bottle.style.setProperty("--h", nextHue);
    });
  }

  // Inicialización de Eventos Delegados
  document.addEventListener("click", function(e) {
    const t = e.target;
    const g = function(a) { return t.closest("[" + a + "]"); };
    let x;

    if (t.id === "modal" || t.id === "filterModal" || t.id === "scrim") {
      closeAll();
      return;
    }

    if (x = g("data-f")) {
      filters.occasion = x.dataset.f;
      renderChips();
      renderGrid();
      return;
    }

    if (t.id === "btnFilterModal" || t.closest("#btnFilterModal")) {
      openFilterModal();
      return;
    }
    if (g("data-close-filters")) {
      closeFilterModal();
      return;
    }

    if (x = g("data-modal-filter")) {
      const type = x.dataset.modalFilter;
      const val = x.dataset.val;
      filters[type] = val;
      populateFilterModal();
      return;
    }

    if (t.id === "btnApplyFilters" || t.closest("#btnApplyFilters")) {
      renderChips();
      renderGrid();
      closeFilterModal();
      return;
    }

    if (t.id === "btnResetFilters" || t.id === "btnResetInline" || t.id === "btnResetEmpty") {
      resetAllFilters();
      if (t.id === "btnResetFilters") {
        populateFilterModal();
      }
      return;
    }

    if (x = g("data-add")) {
      addToCart(Number(x.dataset.add), 50, 1);
      openCart();
    } else if (g("data-adddet")) {
      addToCart(D.id, D.ml, D.q);
      openCart();
    } else if (x = g("data-size")) {
      D.ml = Number(x.dataset.size);
      renderDetail();
    } else if (x = g("data-dq")) {
      D.q = Math.max(1, D.q + Number(x.dataset.dq));
      renderDetail();
    } else if (x = g("data-cq")) {
      const idx = Number(x.dataset.i);
      if (cart[idx]) {
        cart[idx].q += Number(x.dataset.cq);
        if (cart[idx].q < 1) cart.splice(idx, 1);
        save();
        drawCart();
      }
    } else if (x = g("data-open")) {
      openDet(x.dataset.open);
    } else if (g("data-cart")) {
      e.preventDefault();
      openCart();
    } else if (g("data-close")) {
      closeAll();
    } else if (g("data-aura")) {
      const aura = $("#aura");
      if (aura) aura.classList.toggle("on");
    } else if (x = g("data-o")) {
      const m = P.find(p => p.o === x.dataset.o) || P[0];
      const r = $("#aura-r");
      if (r) {
        r.innerHTML = \`Le sugiero <b>\${m.n}</b>: \${(m.no || []).join(", ").toLowerCase()}. <button class="link up" data-open="\${m.id}">Ver detalle</button>\`;
      }
    }
  });

  function initLiveSearch() {
    const input = $("#liveSearch");
    const clearBtn = $("#clearSearch");
    if (!input) return;

    let timeout;
    input.addEventListener("input", function() {
      clearTimeout(timeout);
      const val = input.value.trim();
      if (clearBtn) clearBtn.style.display = val ? "block" : "none";
      timeout = setTimeout(function() {
        filters.search = val;
        renderGrid();
      }, 150);
    });

    if (clearBtn) {
      clearBtn.addEventListener("click", function() {
        input.value = "";
        clearBtn.style.display = "none";
        filters.search = "";
        renderGrid();
        input.focus();
      });
    }
  }

  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") closeAll();
  });

  function initThemeToggle() {
    const btn = $("#toggleTema");
    if (!btn) return;

    function updateLabel() {
      const isLight = document.documentElement.classList.contains("modo-claro");
      btn.textContent = isLight ? "Modo Oscuro" : "Modo Claro";
    }

    btn.addEventListener("click", function() {
      const isLight = document.documentElement.classList.toggle("modo-claro");
      document.documentElement.setAttribute("data-theme", isLight ? "light" : "dark");
      localStorage.setItem("altadensidad_tema", isLight ? "claro" : "oscuro");
      updateLabel();
    });

    updateLabel();
  }

  document.addEventListener("DOMContentLoaded", function() {
    // 1. Render inmediato con datos duros auténticos (0ms LCP, sin parpadeos)
    renderChips();
    renderGrid();
    renderRank();
    renderSizes();
    drawCart();
    initThemeToggle();
    initHeroBottleInteractivity();
    initLiveSearch();

    // 2. Conectar en segundo plano con APIs para actualización continua
    cargarCatalogoBackend();
    cargarTop10Backend();
    cargarEnvasesBackend();

    const els = document.querySelectorAll(".rv");
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(function(es) {
        es.forEach(function(x) {
          if (x.isIntersecting) {
            x.target.classList.add("in");
            io.unobserve(x.target);
          }
        });
      }, { threshold: 0.1 });
      els.forEach(n => io.observe(n));
    } else {
      els.forEach(n => n.classList.add("in"));
    }
  });
})();
`;

fs.writeFileSync(path.join(__dirname, '../assets/js/haute-parfumerie.js'), hauteCode, 'utf8');
console.log('✅ assets/js/haute-parfumerie.js generado correctamente');

// ============================================================
// 2. GENERAR ASSETS/JS/TOP10.JS
// ============================================================
const top10Code = `document.addEventListener('DOMContentLoaded', function () {
    const productGrid = document.getElementById('top10Grid');
    const CACHE_KEY_TOP10 = 'ad_cached_top10_v1';

    // DATOS DUROS OFICIALES: TOP 10 PERFUMES MÁS VENDIDOS
    const DATOS_DUROS_TOP10 = ${JSON.stringify(top10, null, 2)};

    function normalizarImagen(src) {
        if (!src) return 'assets/img/Logo2026.png';
        if (src.startsWith('http://') || src.startsWith('https://')) return src;
        let p = src.trim();
        if (p.startsWith('img/')) {
            p = 'assets/' + p;
        } else if (!p.startsWith('assets/')) {
            p = 'assets/img/' + p;
        }
        return p;
    }

    // 1. Render inmediato: Caché o Datos Duros (0ms LCP, nunca queda en blanco)
    try {
        const cached = localStorage.getItem(CACHE_KEY_TOP10);
        if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.length) {
                mostrarTop10(parsed);
                inyectarSchemaTop10(parsed);
            } else {
                mostrarTop10(DATOS_DUROS_TOP10);
            }
        } else {
            mostrarTop10(DATOS_DUROS_TOP10);
        }
    } catch(e) {
        mostrarTop10(DATOS_DUROS_TOP10);
    }

    // 2. Carga en segundo plano desde API con reintento resiliente
    async function cargarTop10() {
        const endpoints = [
            'http://localhost:3000/api/top10',
            'https://altadensidadpage-production.up.railway.app/api/top10'
        ];

        let exito = false;
        for (const url of endpoints) {
            try {
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), 3500);
                const res = await fetch(url, { signal: controller.signal });
                clearTimeout(timer);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.data && data.data.length) {
                        try { localStorage.setItem(CACHE_KEY_TOP10, JSON.stringify(data.data)); } catch(e) {}
                        mostrarTop10(data.data);
                        inyectarSchemaTop10(data.data);
                        exito = true;
                        break;
                    }
                }
            } catch (err) {}
        }

        // Si fallan todas las redes pero no hay nada renderizado, asegurar datos duros
        if (!exito && (!productGrid.children || productGrid.children.length === 0)) {
            mostrarTop10(DATOS_DUROS_TOP10);
        }
    }

    function inyectarSchemaTop10(items) {
        if (!items || !items.length) return;
        let existing = document.getElementById('schema-top10-dinamico');
        if (existing) existing.remove();

        const schemaData = {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Top 10 Perfumes Más Vendidos - Fragancias de Alta Densidad",
            "itemListOrder": "https://schema.org/ItemListOrderAscending",
            "numberOfItems": items.length,
            "itemListElement": items.map((p, idx) => ({
                "@type": "ListItem",
                "position": idx + 1,
                "item": {
                    "@type": "Product",
                    "name": p.nombre || p.name,
                    "image": normalizarImagen(p.imagen || p.image),
                    "description": p.descripcion || p.description || \`Perfume \${p.nombre || p.name} Top \${idx + 1} en ventas con alta concentración y fijación prolongada.\`,
                    "brand": {
                        "@type": "Brand",
                        "name": "Alta Densidad"
                    },
                    "offers": {
                        "@type": "Offer",
                        "priceCurrency": "COP",
                        "price": Number(p.precio || p.price || 0),
                        "availability": "https://schema.org/InStock",
                        "url": "https://alta-densidad-page.vercel.app/top10.html"
                    }
                }
            }))
        };

        const script = document.createElement('script');
        script.id = 'schema-top10-dinamico';
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schemaData);
        document.head.appendChild(script);
    }

    function mostrarTop10(productsToShow) {
        productGrid.innerHTML = '';
        inyectarSchemaTop10(productsToShow);
        productsToShow.forEach((product, index) => {
            const rank = index + 1;
            const stars = '★'.repeat(product.rating || 5) + '☆'.repeat(5 - (product.rating || 5));
            const productCard = document.createElement('div');
            productCard.className = 'product-card';

            const itemData = {
                id: product.producto_id || product.id,
                name: product.nombre || product.name,
                image: normalizarImagen(product.imagen || product.image),
                category: product.categoria || product.category || 'Perfumería',
                gender: product.genero || product.gender || 'Unisex',
                description: product.descripcion || product.description || '',
                price: Number(product.precio || product.price || 75000),
                rating: product.rating || 5
            };

            productCard.innerHTML = \`
                <div class="product-rank-badge">#\${rank}</div>
                <div class="product-image">
                    <img src="\${itemData.image}" alt="Top #\${rank} Perfume \${itemData.name} - Fragancia Alta Concentración" width="280" height="280" loading="lazy" decoding="async" onerror="this.src='assets/img/Logo2026.png';">
                </div>
                <div class="product-info">
                    <div class="product-name">\${itemData.name}</div>
                    <div class="product-rating">\${stars}</div>
                    <div class="product-category">\${itemData.category}</div>
                    <div class="product-price">$\${itemData.price.toLocaleString('es-CO')} COP</div>
                </div>
                <button class="btn-agregar-carrito" aria-label="Agregar \${itemData.name} al carrito"
                    onclick='event.stopPropagation(); if(window.agregarAlCarrito) window.agregarAlCarrito(\${JSON.stringify({ id: itemData.id, name: itemData.name, image: itemData.image, price: itemData.price })})'>
                    <i class="fas fa-cart-plus" aria-hidden="true"></i> Agregar
                </button>
            \`;

            productCard.addEventListener('click', (e) => {
                if (e.target.closest('.btn-agregar-carrito')) return;
                abrirModalTop10(itemData);
            });

            productGrid.appendChild(productCard);
        });

        const cols = window.innerWidth > 1100 ? 4 : window.innerWidth > 768 ? 3 : 2;
        const resto = productsToShow.length % cols;
        if (resto !== 0) {
            for (let i = 0; i < cols - resto; i++) {
                const ph = document.createElement('div');
                ph.classList.add('product-card-placeholder');
                productGrid.appendChild(ph);
            }
        }
        if (window.ADAnimations) {
            window.ADAnimations.animateTop10('#top10Grid');
        }
    }

    function abrirModalTop10(product) {
        const modal = document.getElementById('productoModal');
        if (!modal) return;
        const stars = '★'.repeat(product.rating || 5) + '☆'.repeat(5 - (product.rating || 5));
        const img = document.getElementById('prodModalImg');
        if (img) {
            img.src = product.image || '';
            img.alt = \`Perfume \${product.name} - Fragancias Alta Densidad\`;
        }
        const nom = document.getElementById('prodModalNombre');
        if (nom) nom.textContent = product.name || '';
        const cat = document.getElementById('prodModalCategoria');
        if (cat) cat.textContent = product.category || 'Perfumería';
        const rat = document.getElementById('prodModalRating');
        if (rat) rat.textContent = stars;
        const gen = document.getElementById('prodModalGenero');
        if (gen) gen.textContent = product.gender ? \`Género: \${product.gender}\` : '';
        const desc = document.getElementById('prodModalDesc');
        if (desc) desc.textContent = product.description || 'Sin descripción disponible.';
        const prec = document.getElementById('prodModalPrecio');
        if (prec) prec.textContent = \`$\${Number(product.price || 0).toLocaleString('es-CO')} COP\`;

        const btnCarrito = document.getElementById('prodModalCarrito');
        if (btnCarrito) {
            btnCarrito.onclick = () => {
                if (window.agregarAlCarrito) {
                    window.agregarAlCarrito({
                        id: product.id,
                        name: product.name,
                        image: product.image,
                        price: product.price
                    });
                }
            };
        }

        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    const cerrarBtn = document.getElementById('cerrarProdModal');
    if (cerrarBtn) {
        cerrarBtn.addEventListener('click', () => {
            const modal = document.getElementById('productoModal');
            if (modal) modal.classList.remove('open');
            document.body.style.overflow = '';
        });
    }

    cargarTop10();
});

let lastScrollTop = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > lastScrollTop && scrollTop > 80) {
        if (header) header.classList.add('header--hidden');
    } else {
        if (header) header.classList.remove('header--hidden');
    }
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
}, { passive: true });
`;

fs.writeFileSync(path.join(__dirname, '../assets/js/top10.js'), top10Code, 'utf8');
console.log('✅ assets/js/top10.js generado correctamente');

// ============================================================
// 3. GENERAR ASSETS/JS/ENVASES.JS
// ============================================================
const envasesCode = `document.addEventListener('DOMContentLoaded', async function() {
    const productGrid = document.getElementById('productGrid');
    const CACHE_KEY_ENVASES = 'ad_cached_envases_v1';
    const WA = "573046477694";

    // DATOS DUROS OFICIALES: CATÁLOGO DE ENVASES
    const DATOS_DUROS_ENVASES = ${JSON.stringify(envases, null, 2)};

    function normalizarImagenEnvase(src) {
        if (!src) return 'assets/img/Logo2026.png';
        if (src.startsWith('http://') || src.startsWith('https://')) return src;
        let p = src.trim();
        if (p.startsWith('img/')) {
            p = 'assets/' + p;
        } else if (!p.startsWith('assets/')) {
            p = 'assets/img/' + p;
        }
        return p
            .replace(/cartier\\.jpeg$/i, 'CARTIER.jpeg')
            .replace(/cilindro\\.jpeg$/i, 'CILINDRO.jpeg')
            .replace(/amira\\.jpeg$/i, 'AMIRA.jpeg')
            .replace(/victory\\.jpeg$/i, 'VICTORY.jpeg')
            .replace(/eros\\.jpeg$/i, 'EROS.jpeg');
    }

    function inyectarSchemaEnvases(lista) {
        if (!lista || !lista.length) return;
        let existing = document.getElementById('schema-envases-dinamico');
        if (existing) existing.remove();

        const schemaData = {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Catálogo de Envases y Presentaciones - Fragancias de Alta Densidad",
            "numberOfItems": lista.length,
            "itemListElement": lista.map((e, idx) => ({
                "@type": "ListItem",
                "position": idx + 1,
                "item": {
                    "@type": "Product",
                    "name": \`Envase \${e.name || e.nombre}\`,
                    "image": normalizarImagenEnvase(e.image || e.imagen),
                    "description": e.description || e.descripcion || \`Envase \${e.name || e.nombre} para perfumería en material \${e.material || 'vidrio premium'}.\`,
                    "brand": {
                        "@type": "Brand",
                        "name": "Alta Densidad"
                    },
                    "offers": {
                        "@type": "Offer",
                        "priceCurrency": "COP",
                        "price": Number(e.price || e.precio || 0),
                        "availability": "https://schema.org/InStock",
                        "url": "https://alta-densidad-page.vercel.app/envases.html"
                    }
                }
            }))
        };

        const script = document.createElement('script');
        script.id = 'schema-envases-dinamico';
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schemaData);
        document.head.appendChild(script);
    }

    // 1. Cargar caché o datos duros de inmediato (0ms LCP)
    try {
        const cached = localStorage.getItem(CACHE_KEY_ENVASES);
        if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.length) {
                displayProducts(parsed);
            } else {
                displayProducts(DATOS_DUROS_ENVASES);
            }
        } else {
            displayProducts(DATOS_DUROS_ENVASES);
        }
    } catch(e) {
        displayProducts(DATOS_DUROS_ENVASES);
    }

    function displayProducts(envasesList) {
        if (!productGrid) return;
        productGrid.innerHTML = '';
        inyectarSchemaEnvases(envasesList);

        if (!envasesList || envasesList.length === 0) {
            displayProducts(DATOS_DUROS_ENVASES);
            return;
        }

        envasesList.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            const imgUrl = normalizarImagenEnvase(product.image || product.imagen);
            const nom = product.name || product.nombre;
            const altText = \`Envase para perfume \${nom} - \${product.material || 'Vidrio Premium'}\`;
            
            // Garantizar tallas reales
            const coincidencia = DATOS_DUROS_ENVASES.find(e => e.name.toLowerCase() === nom.toLowerCase());
            const tallasArray = (Array.isArray(product.sizes) && product.sizes.length)
                ? product.sizes
                : (coincidencia ? coincidencia.sizes : ['30ml', '60ml']);

            const msgWa = encodeURIComponent(\`¡Hola! Me gustaría pedir una fragancia con el envase \${nom} en Alta Densidad. ✨\`);

            productCard.innerHTML = \`
                <div class="product-image">
                    <img src="\${imgUrl}" alt="\${altText}" width="280" height="280" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='assets/img/Logo2026.png';">
                </div>
                <div class="product-info" style="display:flex; flex-direction:column; justify-content:space-between; height:100%;">
                    <div>
                        <div class="product-name">\${nom}</div>
                        <div class="product-sizes" style="font-weight:600; color:var(--azul-dos, #D4AF37);">Presentaciones: \${tallasArray.join(', ')}</div>
                        <div class="product-material" style="color:var(--c-mute, #888); font-size:0.85rem; margin-bottom:6px;">Material: \${product.material || 'Vidrio Premium'}</div>
                        <div class="product-description">\${product.description || product.descripcion || 'Diseño exclusivo en cristal tallado para perfumería de autor.'}</div>
                    </div>
                    <a class="product-button" style="text-decoration:none; display:flex; align-items:center; justify-content:center; gap:8px; margin-top:12px; width:100%; box-sizing:border-box;"
                       href="https://wa.me/\${WA}?text=\${msgWa}" target="_blank" rel="noopener">
                        <i class="fab fa-whatsapp" aria-hidden="true"></i> Pedir este envase
                    </a>
                </div>
            \`;
            productGrid.appendChild(productCard);
        });

        const cols = window.innerWidth > 1100 ? 4 : window.innerWidth > 768 ? 3 : 2;
        const resto = envasesList.length % cols;
        if (resto !== 0) {
            for (let i = 0; i < cols - resto; i++) {
                const ph = document.createElement('div');
                ph.classList.add('product-card-placeholder');
                productGrid.appendChild(ph);
            }
        }
        if (window.ADAnimations) {
            window.ADAnimations.animateEnvases('#productGrid');
        }
    }

    // 2. Carga en segundo plano con reintento resiliente
    async function cargarEnvases() {
        const endpoints = [
            'http://localhost:3000/api/envases',
            'https://altadensidadpage-production.up.railway.app/api/envases'
        ];

        let cargados = false;
        for (const url of endpoints) {
            try {
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), 3500);
                const res = await fetch(url, { signal: controller.signal });
                clearTimeout(timer);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.data && data.data.length) {
                        try { localStorage.setItem(CACHE_KEY_ENVASES, JSON.stringify(data.data)); } catch(e) {}
                        displayProducts(data.data);
                        cargados = true;
                        break;
                    }
                }
            } catch(e) {}
        }

        if (!cargados && (!productGrid.children || productGrid.children.length === 0)) {
            displayProducts(DATOS_DUROS_ENVASES);
        }
    }

    cargarEnvases();
});

let lastScrollTop = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > lastScrollTop && scrollTop > 80) {
        if (header) header.classList.add('header--hidden');
    } else {
        if (header) header.classList.remove('header--hidden');
    }
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
}, { passive: true });
`;

fs.writeFileSync(path.join(__dirname, '../assets/js/envases.js'), envasesCode, 'utf8');
console.log('✅ assets/js/envases.js generado correctamente');

console.log('🎉 Sincronización completada con éxito!');
