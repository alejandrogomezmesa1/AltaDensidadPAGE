/**
 * HAUTE PARFUMERIE — Alta Densidad
 * Arquitectura de Autor: Bolsa reactiva, buscador en vivo, atelier de filtros olfativos,
 * modal de pirámide olfativa, integración backend Railway y Aura Concierge.
 */
(function() {
  const WA = "573046477694";
  const SIZES = [
    { ml: 30, x: 0.6, s: 1.3, n: "Viaje", t: "Atomizador compacto para llevar contigo." },
    { ml: 50, x: 1.0, s: 1.7, n: "Insignia", t: "El formato de la casa, para el uso diario." },
    { ml: 100, x: 1.8, s: 2.1, n: "Colección", t: "Botella grande para quienes no quieren quedarse sin ella." }
  ];

  // Catálogo curado de alta perfumería de autor
  let P = [
    { id: 0, n: "Nº 01 Obsidiana", f: "Amaderada", o: "Noche", g: "Unisex", no: ["Pimienta negra", "Oud · Cuero", "Ámbar"], p: 189000, h: 28 },
    { id: 1, n: "Nº 02 Clavo & Rosa", f: "Especiada", o: "Noche", g: "Unisex", no: ["Clavo", "Rosa", "Vainilla"], p: 189000, h: 350 },
    { id: 2, n: "Nº 03 Bergamota", f: "Cítrica", o: "Verano", g: "Unisex", no: ["Bergamota", "Neroli", "Almizcle"], p: 169000, h: 48 },
    { id: 3, n: "Nº 04 Vetiver Ceniza", f: "Amaderada", o: "Oficina", g: "Masculino", no: ["Pimienta rosa", "Vetiver", "Cedro"], p: 179000, h: 150 },
    { id: 4, n: "Nº 05 Ámbar Líquido", f: "Dulce", o: "Noche", g: "Unisex", no: ["Canela", "Ámbar", "Tonka · Caramelo"], p: 189000, h: 22 },
    { id: 5, n: "Nº 06 Sal Marina", f: "Fresca", o: "Verano", g: "Unisex", no: ["Sal", "Salvia", "Madera flotada"], p: 169000, h: 200 },
    { id: 6, n: "Nº 07 Cuero Blanco", f: "Cuero", o: "Noche", g: "Unisex", no: ["Cardamomo", "Cuero suave", "Almizcle"], p: 189000, h: 15 },
    { id: 7, n: "Nº 08 Té Negro", f: "Aromática", o: "Oficina", g: "Unisex", no: ["Bergamota", "Té negro", "Cedro"], p: 179000, h: 95 },
    { id: 8, n: "Nº 09 Iris Noir", f: "Floral", o: "Noche", g: "Femenino", no: ["Mandarina", "Iris", "Pachulí"], p: 189000, h: 270 },
    { id: 9, n: "Nº 10 Higo Verde", f: "Verde", o: "Verano", g: "Unisex", no: ["Hoja de higuera", "Higo", "Sándalo"], p: 169000, h: 110 }
  ];

  const $ = function(s) { return document.querySelector(s); };
  const $$ = function(s) { return document.querySelectorAll(s); };
  const fmt = function(n) { return "$" + Number(n).toLocaleString("es-CO"); };

  // Filtros activos
  let filters = {
    search: "",
    occasion: "Todos",
    family: "Todos",
    gender: "Todos"
  };

  // Carrito y selección
  let cart = [];
  let D = { id: 0, ml: 50, q: 1 };

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
    return Math.round((p.p * sz(ml).x) / 1000) * 1000;
  }

  function bt(h, s, img, name) {
    if (img) {
      return `
        <div class="bottle-wrap">
          <img src="${img}" alt="${name || 'Fragancia'}" class="stage-real-img" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';">
          <div class="bottle fallback-bottle" style="--h:${h || 32};--s:${s || 1.7};display:none"><i></i></div>
        </div>
      `;
    }
    return `<div class="bottle" style="--h:${h};--s:${s}"><i></i></div>`;
  }

  function desc(p) {
    if (p.desc) return p.desc;
    return `Una fragancia ${p.f.toLowerCase()} de alta densidad. Abre con ${p.no[0].toLowerCase()}, se asienta en ${p.no[1].toLowerCase()} y deja un fondo memorable de ${p.no[2].toLowerCase()}. Concentración extra al 33% con base de feromonas.`;
  }

  function normalizar(txt) {
    return (txt || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  }

  function filtrarProductos() {
    const term = normalizar(filters.search);
    return P.filter(function(p) {
      // 1. Filtro por buscador
      if (term) {
        const enNombre = normalizar(p.n).includes(term);
        const enFamilia = normalizar(p.f).includes(term);
        const enOcasion = normalizar(p.o).includes(term);
        const enNotas = p.no && p.no.some(n => normalizar(n).includes(term));
        const enDesc = p.desc ? normalizar(p.desc).includes(term) : false;
        if (!enNombre && !enFamilia && !enOcasion && !enNotas && !enDesc) return false;
      }

      // 2. Filtro por ocasión
      if (filters.occasion !== "Todos") {
        if (p.o !== filters.occasion) return false;
      }

      // 3. Filtro por familia
      if (filters.family !== "Todos") {
        if (p.f !== filters.family) return false;
      }

      // 4. Filtro por género/estilo
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
      return `<button class="chip up ${x === filters.occasion ? 'on' : ''}" data-f="${x}">${x}</button>`;
    }).join("");
  }

  function renderGrid() {
    const el = $("#grid");
    const statusEl = $("#filterStatus");
    const metaEl = $("#coleccionMeta");
    if (!el) return;

    const filtrados = filtrarProductos();

    // Actualizar texto de estado
    if (statusEl) {
      const activeCount = getActiveFilterCount();
      if (activeCount > 0) {
        statusEl.style.display = "flex";
        statusEl.innerHTML = `
          <span>Mostrando <b>${filtrados.length}</b> de ${P.length} fragancias</span>
          <button class="link up" id="btnResetInline" style="font-size:var(--fs-2)">Limpiar filtros</button>
        `;
      } else {
        statusEl.style.display = "none";
      }
    }

    if (metaEl) {
      metaEl.textContent = `${P.length} formulaciones · 33% de extracto puro · Base de feromonas`;
    }

    updateFilterBadge();

    // Caso: No se encontraron resultados
    if (!filtrados.length) {
      el.innerHTML = `
        <div style="grid-column: 1 / -1; padding: var(--sp-6) var(--sp-4); text-align: center; background: var(--c-bg);">
          <p class="mute" style="font-size: var(--fs-4); font-family: var(--f-display); margin-bottom: var(--sp-3);">
            No encontramos ninguna fragancia que coincida con estos criterios.
          </p>
          <button class="btn btn--line up" id="btnResetEmpty">Ver toda la colección</button>
        </div>
      `;
      return;
    }

    el.innerHTML = filtrados.map(function(p) {
      return `
        <article class="card">
          <div class="stage" data-open="${p.id}">
            <span class="tag up">33% extracto</span>
            ${bt(p.h, 1, p.img, p.n)}
            <div class="notes">${(p.no || []).join(" · ")}</div>
          </div>
          <div class="info">
            <div>
              <h3 data-open="${p.id}">${p.n}</h3>
              <span>${p.f} · desde ${fmt(pr(p, 30))}</span>
            </div>
            <button class="link up" data-add="${p.id}">Añadir</button>
          </div>
        </article>
      `;
    }).join("");
  }

  function renderRank() {
    const el = $("#rank");
    if (!el) return;
    el.innerHTML = P.slice(0, 10).map(function(p, i) {
      return `
        <div class="row rv">
          <span class="n">${i < 9 ? "0" : ""}${i + 1}</span>
          <div>
            <h3 data-open="${p.id}">${p.n}</h3>
            <small>${p.f} · ${(p.no || []).join(" · ")}</small>
          </div>
          <span class="pr">${fmt(pr(p, 50))}</span>
          <button class="link up" data-open="${p.id}">Ver</button>
        </div>
      `;
    }).join("");
  }

  function renderSizes() {
    const el = $("#sizes");
    if (!el) return;
    el.innerHTML = SIZES.map(function(z) {
      return `
        <div class="size rv">
          <div class="stage">${bt(32, z.s)}</div>
          <b>${z.ml} ml</b>
          <span class="up eyebrow">${z.n}</span>
          <p class="mute" style="font-size:var(--fs-2)">${z.t}</p>
          <a class="link up" href="#coleccion">Elegir fragancia</a>
        </div>
      `;
    }).join("");
  }

  function renderDetail() {
    const sheet = $("#sheet");
    if (!sheet) return;
    const p = P.find(item => item.id === D.id) || P[0];
    const z = sz(D.ml);

    sheet.innerHTML = `
      <button class="x up" data-close aria-label="Cerrar detalle">✕ Cerrar</button>
      <div class="stage">${bt(p.h, z.s + 0.3, p.img, p.n)}</div>
      <div class="d-info">
        <span class="up eyebrow">${p.f} · Ocasión: ${p.o}</span>
        <h2>${p.n}</h2>
        <p class="mute">${desc(p)}</p>
        <dl class="pyr">
          <div><dt class="up">Salida</dt><dd>${p.no ? p.no[0] : 'Bergamota'}</dd></div>
          <div><dt class="up">Corazón</dt><dd>${p.no ? p.no[1] : 'Esencia de autor'}</dd></div>
          <div><dt class="up">Fondo</dt><dd>${p.no ? p.no[2] : 'Ámbar y feromonas'}</dd></div>
        </dl>
        <div class="specs up">
          <div><b>33%</b>Extracto</div>
          <div><b>12h+</b>Fijación</div>
          <div><b>+</b>Feromonas</div>
        </div>
        <div class="pick up">
          ${SIZES.map(s => `
            <button class="chip ${s.ml === D.ml ? 'on' : ''}" data-size="${s.ml}">${s.ml} ml</button>
          `).join("")}
        </div>
        <div class="buy">
          <b style="font:300 28px var(--f-display)">${fmt(pr(p, D.ml) * D.q)}</b>
          <div class="qty">
            <button data-dq="-1" aria-label="Disminuir">−</button>
            <span>${D.q}</span>
            <button data-dq="1" aria-label="Aumentar">+</button>
          </div>
          <button class="btn up" data-adddet>Añadir a la bolsa</button>
        </div>
      </div>
    `;
  }

  // Lógica del Modal de Filtros Avanzados (Atelier Olfativo)
  function populateFilterModal() {
    const fpFamilies = $("#fpFamilies");
    const fpOccasions = $("#fpOccasions");
    const fpGenders = $("#fpGenders");

    if (!fpFamilies || !fpOccasions || !fpGenders) return;

    // Obtener familias únicas
    const familias = ["Todos", ...new Set(P.map(x => x.f).filter(Boolean))];
    fpFamilies.innerHTML = familias.map(f => `
      <button class="chip up ${filters.family === f ? 'on' : ''}" data-modal-filter="family" data-val="${f}">${f}</button>
    `).join("");

    // Ocasiones
    const ocasiones = ["Todos", "Noche", "Oficina", "Verano"];
    fpOccasions.innerHTML = ocasiones.map(o => `
      <button class="chip up ${filters.occasion === o ? 'on' : ''}" data-modal-filter="occasion" data-val="${o}">${o}</button>
    `).join("");

    // Géneros / Estilos
    const generos = ["Todos", "Unisex", "Masculino", "Femenino"];
    fpGenders.innerHTML = generos.map(g => `
      <button class="chip up ${filters.gender === g ? 'on' : ''}" data-modal-filter="gender" data-val="${g}">${g}</button>
    `).join("");

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
        const p = P.find(item => item.id === l.id) || { n: "Fragancia", p: 180000, h: 30 };
        const u = pr(p, l.ml);
        t += u * l.q;
        c += l.q;
        return `
          <div class="it">
            <div class="mini" style="--h:${p.h || 30}"></div>
            <div>
              <b class="up">${p.n}</b>
              <small>${l.ml} ml · ${fmt(u)}</small>
              <div class="qty" style="margin-top:var(--sp-2)">
                <button data-cq="-1" data-i="${i}">−</button>
                <span>${l.q}</span>
                <button data-cq="1" data-i="${i}">+</button>
              </div>
            </div>
            <div>${fmt(u * l.q)}</div>
          </div>
        `;
      }).join("");
    } else {
      itemsEl.innerHTML = `
        <div class="empty">
          <p>Tu bolsa está vacía.</p>
          <p style="margin-top:var(--sp-3)"><a class="link up" href="#coleccion" data-close>Ver colección</a></p>
        </div>
      `;
    }

    if (totalEl) totalEl.textContent = fmt(t);
    if (cntEl) cntEl.textContent = c;

    const waBtn = $("#wa");
    if (waBtn) {
      const msg = "¡Hola! Quiero hacer un pedido en Fragancias de Alta Densidad:\n\n" +
        cart.map(l => {
          const p = P.find(item => item.id === l.id) || { n: "Fragancia" };
          return `• ${l.q} x ${p.n} (${l.ml} ml) = ${fmt(pr(p, l.ml) * l.q)}`;
        }).join("\n") +
        `\n\nTotal: ${fmt(t)}\n¿Me confirman disponibilidad y despacho? ✨`;

      waBtn.href = cart.length ? `https://wa.me/${WA}?text=${encodeURIComponent(msg)}` : "#";
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

  // Integración de productos dinámicos del backend con cache instantáneo
  async function cargarCatalogoBackend() {
    try {
      const cached = localStorage.getItem("ad_cached_products_v1");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          adaptarYRenderizar(parsed);
        }
      }
    } catch(e) {}

    try {
      const resp = await fetch('https://altadensidadpage-production.up.railway.app/api/productos');
      if (resp.ok) {
        const json = await resp.json();
        const lista = json.success ? json.data : (Array.isArray(json) ? json : null);
        if (lista && lista.length) {
          const activos = lista.filter(x => x.activo !== 0);
          try { localStorage.setItem("ad_cached_products_v1", JSON.stringify(activos)); } catch(e) {}
          adaptarYRenderizar(activos);
        }
      }
    } catch(e) {
      console.log("Modo offline / catálogo curado activo");
    }
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

      // Detección de género
      if (item.gender) {
        gen = item.gender;
      } else if (descLow.includes("femenin") || nameLow.includes("rose") || nameLow.includes("mujer")) {
        gen = "Femenino";
      } else if (descLow.includes("masculin") || nameLow.includes("hombre")) {
        gen = "Masculino";
      }

      // Detección de ocasión y familia
      if (descLow.includes("fresc") || descLow.includes("cítric") || descLow.includes("verano") || nameLow.includes("aqua")) {
        occ = "Verano";
        fam = "Cítrica / Fresca";
        hue = 190;
      } else if (descLow.includes("oficina") || descLow.includes("elegante") || descLow.includes("diario") || descLow.includes("versátil")) {
        occ = "Oficina";
        fam = "Aromática";
        hue = 130;
      } else if (descLow.includes("dulce") || descLow.includes("vainilla") || descLow.includes("gourmand") || descLow.includes("caramelo")) {
        fam = "Dulce / Gourmand";
        hue = 24;
      } else if (descLow.includes("floral") || nameLow.includes("rosa") || nameLow.includes("iris")) {
        fam = "Floral";
        hue = 330;
      } else if (descLow.includes("cuero") || nameLow.includes("cuero") || nameLow.includes("leather")) {
        fam = "Cuero";
        hue = 16;
      } else if (catLow.includes("arabe") || descLow.includes("oriental") || descLow.includes("especiad")) {
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
        p: Number(item.price) || 180000,
        h: hue,
        desc: item.description || null,
        img: item.image || (item.images && item.images[0]) || null
      };
    });

    if (nuevos.length) {
      P = nuevos;
      renderChips();
      renderGrid();
      renderRank();
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
      bottle.style.transform = `perspective(600px) rotateY(${x * 16}deg) rotateX(${-y * 16}deg) translateY(-8px)`;
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

    // Filtros rápidos por ocasión (chips superiores)
    if (x = g("data-f")) {
      filters.occasion = x.dataset.f;
      renderChips();
      renderGrid();
      return;
    }

    // Modal de Filtros Avanzados: Abrir / Cerrar
    if (t.id === "btnFilterModal" || t.closest("#btnFilterModal")) {
      openFilterModal();
      return;
    }
    if (g("data-close-filters")) {
      closeFilterModal();
      return;
    }

    // Modal de Filtros: Selección de opciones
    if (x = g("data-modal-filter")) {
      const type = x.dataset.modalFilter;
      const val = x.dataset.val;
      filters[type] = val;
      populateFilterModal();
      return;
    }

    // Modal de Filtros: Aplicar
    if (t.id === "btnApplyFilters" || t.closest("#btnApplyFilters")) {
      renderChips();
      renderGrid();
      closeFilterModal();
      return;
    }

    // Limpiar filtros
    if (t.id === "btnResetFilters" || t.id === "btnResetInline" || t.id === "btnResetEmpty") {
      resetAllFilters();
      if (t.id === "btnResetFilters") {
        populateFilterModal();
      }
      return;
    }

    // Acciones de compra y navegación
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
        r.innerHTML = `Le sugiero <b>${m.n}</b>: ${(m.no || []).join(", ").toLowerCase()}. <button class="link up" data-open="${m.id}">Ver detalle</button>`;
      }
    }
  });

  // Buscador en Vivo con debounce
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

  // Tema Claro / Oscuro sincronizado
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

  // Inicializar todo
  document.addEventListener("DOMContentLoaded", function() {
    renderChips();
    renderGrid();
    renderRank();
    renderSizes();
    drawCart();
    initThemeToggle();
    initHeroBottleInteractivity();
    initLiveSearch();
    cargarCatalogoBackend();

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
