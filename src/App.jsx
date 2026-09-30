import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { TemaProvider } from './lib/hooks';
import { UbicacionReal } from './lib/ubicacion';
import { TiendaProvider } from './tienda/TiendaContext';
import TiendaLayout from './tienda/TiendaLayout';
import { DesplazarAlCambiar } from './tienda/Marco';
import Inicio from './paginas/Inicio';
import Top10 from './paginas/Top10';
import Catalogo from './paginas/Catalogo';
import FichaPagina from './paginas/FichaPagina';
import NoEncontrado from './paginas/NoEncontrado';
import Nosotros from './paginas/Nosotros';
import Login from './acceso/Login';
import Reset from './acceso/Reset';
import ResultadoPago from './acceso/ResultadoPago';

// El panel carga aparte (Chart.js y SweetAlert2 solo los necesita el admin)
const Admin = lazy(() => import('./admin/Admin'));

// El estado de la tienda vive solo en sus rutas: al volver desde el pago se relee la bolsa guardada
function Tienda() {
  return (
    <TiendaProvider>
      <TiendaLayout />
    </TiendaProvider>
  );
}

// Rutas de la web anterior (.html) que puedan llegar desde enlaces viejos
const LEGADO = [
  ['index', '/'], ['top10', '/top10'], ['envases', '/catalogo?ver=crear'], ['nosotros', '/nosotros'],
  ['login', '/login'], ['reset', '/reset'], ['admin', '/admin'],
  ['success', '/success'], ['failure', '/failure'], ['pending', '/pending']
];

function RedirigirConQuery({ a }) {
  const [pathname, query] = a.split('?');
  return <Navigate to={{ pathname, search: window.location.search || (query ? `?${query}` : ''), hash: window.location.hash }} replace />;
}

// Con state.fondo (ficha abierta desde la tienda) se sigue pintando la página de fondo y la ficha
// va encima como ventana; sin fondo (enlace directo) la ruta /perfume/<slug> es una página.
function Rutas() {
  const location = useLocation();
  const fondo = location.state && location.state.fondo;
  return (
    <UbicacionReal.Provider value={location}>
      <Routes location={fondo || location}>
        <Route element={<Tienda />}>
          <Route index element={<Inicio />} />
          <Route path="top10" element={<Top10 />} />
          <Route path="catalogo" element={<Catalogo />} />
          {/* Los envases se eligen ahora en "Crea tu perfume" */}
          <Route path="envases" element={<Navigate to="/catalogo?ver=crear" replace />} />
          <Route path="nosotros" element={<Nosotros />} />
          {/* Enlace directo a cada perfume y kit; abiertos desde la tienda se ven como ventana */}
          <Route path="perfume/*" element={<FichaPagina tipo="perfume" />} />
          <Route path="kit/:slug" element={<FichaPagina tipo="kit" />} />
          <Route path="*" element={<NoEncontrado />} />
        </Route>
        <Route path="login" element={<Login />} />
        <Route path="reset" element={<Reset />} />
        <Route path="success" element={<ResultadoPago tipo="success" />} />
        <Route path="pending" element={<ResultadoPago tipo="pending" />} />
        <Route path="failure" element={<ResultadoPago tipo="failure" />} />
        <Route path="admin" element={<Suspense fallback={null}><Admin /></Suspense>} />
        {LEGADO.map(([viejo, nuevo]) => <Route key={viejo} path={`${viejo}.html`} element={<RedirigirConQuery a={nuevo} />} />)}
      </Routes>
    </UbicacionReal.Provider>
  );
}

export default function App() {
  return (
    <TemaProvider>
      <BrowserRouter>
        <DesplazarAlCambiar />
        <Rutas />
      </BrowserRouter>
    </TemaProvider>
  );
}
