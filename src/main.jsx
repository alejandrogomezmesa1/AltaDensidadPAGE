import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Sistema de diseño Haute Parfumerie (tokens, base, componentes y secciones) + AURA + acceso.
// acceso.css queda encerrado bajo body.acc-body en el build (vite.config.js).
import './styles/haute-parfumerie.css';
import './styles/chatbot.css';
import './styles/acceso.css';
import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
