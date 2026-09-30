// Dirección real del navegador. Con una ficha abierta como ventana, <Routes location={fondo}>
// hace que las páginas vean la dirección de fondo; la tienda necesita la real (/perfume/<slug>).
import { createContext, useContext } from 'react';
import { useLocation } from 'react-router-dom';

export const UbicacionReal = createContext(null);

export function useUbicacionReal() {
  const real = useContext(UbicacionReal);
  const vista = useLocation();
  return real || vista;
}
