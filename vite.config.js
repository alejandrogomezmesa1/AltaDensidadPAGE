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

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        encerrarEn('.acc-body', /acceso\.css$/),
        encerrarEn('.adm', /admin-hp\.css$/)
      ]
    }
  },
  server: { port: 5173 }
});
