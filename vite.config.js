import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import prefixer from 'postcss-prefix-selector';

// acceso.css y admin-hp.css definen clases genéricas con estilos distintos (.alerta, .form-group,
// .hidden). En la web anterior nunca coincidían porque cada página cargaba solo su hoja; en la SPA
// conviven, así que cada una queda encerrada bajo la clase que su layout pone en <body>.
function encerrarEn(prefijo, archivo) {
  return prefixer({
    prefix: prefijo,
    includeFiles: [archivo],
    transform(pre, selector) {
      if (selector.startsWith(':root') || selector.startsWith('body')) return selector;
      if (selector.startsWith('html')) {
        const [raiz, ...resto] = selector.split(' ');
        return resto.length ? `${raiz} ${pre} ${resto.join(' ')}` : selector;
      }
      return `${pre} ${selector}`;
    }
  });
}

// En pantallas táctiles (iPhone, iPad) tocar un elemento activa su :hover y lo deja "pegado":
// paneles y textos de hover quedaban encima del contenido. Toda regla con :hover se envuelve en
// @media (hover: hover), así solo existe donde hay mouse o trackpad. Lo que en táctil deba verse
// siempre se declara en @media (hover: none).
function hoverSoloConPuntero() {
  const MEDIA = '(hover: hover)';
  return {
    postcssPlugin: 'hover-solo-con-puntero',
    Rule(rule, { AtRule }) {
      if (rule.envuelta || !rule.selector.includes(':hover')) return;
      for (let a = rule.parent; a; a = a.parent) if (a.type === 'atrule' && a.params && a.params.includes('hover: hover')) return;
      const conHover = rule.selectors.filter((s) => s.includes(':hover'));
      const sinHover = rule.selectors.filter((s) => !s.includes(':hover'));
      const copia = rule.clone({ selectors: conHover });
      copia.envuelta = true;
      const media = new AtRule({ name: 'media', params: MEDIA });
      media.append(copia);
      rule.after(media);
      if (sinHover.length) rule.selectors = sinHover;
      else rule.remove();
    }
  };
}
hoverSoloConPuntero.postcss = true;

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        encerrarEn('.acc-body', /acceso\.css$/),
        encerrarEn('.adm', /admin-hp\.css$/),
        hoverSoloConPuntero()
      ]
    }
  },
  server: { port: 5173 }
});
