// Backend de la tienda (Railway). En desarrollo se puede apuntar a otro con VITE_API_URL.
export const API = (import.meta.env.VITE_API_URL || 'https://altadensidadpage-production.up.railway.app/api').replace(/\/$/, '');

export const WA = '573046477694';
export const SITIO = 'https://alta-densidad-page.vercel.app';

// Mensaje del botón flotante de WhatsApp
export const WA_FLOTANTE = 'https://wa.me/3046477694?text=%C2%A1Hola%21%20%F0%9F%91%8B%20Vi%20su%20cat%C3%A1logo%20en%20la%20web%20y%20me%20gustar%C3%ADa%20recibir%20m%C3%A1s%20informaci%C3%B3n%20sobre%20sus%20perfumes.%20%E2%9C%A8';
export const WA_ASESOR_PEDIDO = 'https://wa.me/573046477694?text=%C2%A1Hola!%20Tengo%20una%20consulta%20sobre%20mi%20pedido%20en%20la%20web.';

export const ENVIO_TARIFAS = { medellin: 15000, metropolitana: 20000, nacional: 22000 };
export const ENVIO_ZONAS = { medellin: 'Medellín', metropolitana: 'Área Metropolitana', nacional: 'Nacional' };
