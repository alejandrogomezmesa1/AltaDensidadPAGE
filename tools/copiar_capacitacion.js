// Tras `vite build`: publica la plataforma de capacitación (HTML estático propio) dentro de dist/
import { cpSync, existsSync } from 'node:fs';

const origen = 'plataforma-capacitacion';
if (existsSync(origen)) {
  cpSync(origen, `dist/${origen}`, { recursive: true });
  console.log(`[build] ${origen} copiada a dist/`);
}
