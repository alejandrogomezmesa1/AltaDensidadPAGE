// Identidad de marca (brand book v3): el símbolo de la gota tallada, el destello y el logotipo.
// El símbolo es una gota de esencia tallada como diamante; las facetas son cortes (máscara), así
// funciona sobre cualquier fondo y toma el color del texto (currentColor).
import { useId } from 'react';

const SILUETA = 'M50,2 L63,27 L76,46 L81,63 L77,79 L65,92 L50,98 L35,92 L23,79 L19,63 L24,46 L37,27 Z';
const FACETAS = 'M24,46 L76,46 M50,2 L38,46 M50,2 L62,46 M50,2 L50,46 M37,27 L50,46 L63,27 '
  + 'M24,46 L38,46 L50,98 M76,46 L62,46 L50,98 M50,46 L50,98 M19,63 L38,46 M81,63 L62,46';
const FACETAS_SIMPLES = 'M24,46 L76,46 M50,2 L38,46 M50,2 L62,46 M38,46 L50,98 M62,46 L50,98';

// size en px; simple = menos facetas para tamaños pequeños (≤ 24 px)
export function Simbolo({ size = 32, simple = size <= 24, className, titulo }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 100 100" role={titulo ? 'img' : undefined}
      aria-label={titulo} aria-hidden={titulo ? undefined : true} focusable="false">
      <defs>
        <mask id={`gt${id}`} maskUnits="userSpaceOnUse" x="-50" y="-50" width="200" height="200">
          <rect x="-50" y="-50" width="200" height="200" fill="#fff" />
          <path d={simple ? FACETAS_SIMPLES : FACETAS} fill="none" stroke="#000" strokeWidth={simple ? 3.2 : 1.5}
            strokeLinecap="round" strokeLinejoin="round" />
        </mask>
      </defs>
      <path d={SILUETA} fill="currentColor" mask={`url(#gt${id})`} />
    </svg>
  );
}

// Destello de 4 puntas (avatar de AURA, novedades)
export function Destello({ size = 16, className }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12,1 C12.9,11.1 12.9,11.1 23,12 C12.9,12.9 12.9,12.9 12,23 C11.1,12.9 11.1,12.9 1,12 C11.1,11.1 11.1,11.1 12,1 Z" fill="currentColor" />
    </svg>
  );
}

// Imagotipo horizontal: símbolo + ALTA DENSIDAD + descriptor
export function Logotipo({ simbolo = 30, descriptor = 'Fragancias', className = '' }) {
  return (
    <span className={`logotipo ${className}`}>
      <Simbolo size={simbolo} className="logotipo-simbolo" />
      <span className="logotipo-texto">
        <span className="logotipo-nombre">Alta Densidad</span>
        {descriptor && <span className="logotipo-desc">{descriptor}</span>}
      </span>
    </span>
  );
}
