// Perfumes afines por acorde principal. Los acordes de cada perfume vienen ordenados de más a menos
// intenso (como en Fragrantica; producto_acordes.orden), así que el primero es el principal.
//
// Para cada candidato 1.1 disponible:
//   1. Prominencia: dónde aparece el acorde principal del perfume visto. Si también es su acorde
//      principal vale 1; si es el segundo, 1/2; el tercero, 1/3… Si no lo tiene, no se sugiere
//      (solo se usa para completar la lista cuando hay muy pocos).
//   2. Perfil: parecido del resto de acordes, pesando más los primeros (coseno de pesos 1/(posición+1)).
//   3. Desempate final: notas en común.
// Afinidad (%) = 75 % prominencia + 25 % perfil, y se ordena por ella: un perfume con el mismo acorde
// principal (≥ 75 %) siempre queda por encima de uno que lo tiene en segundo lugar (≤ 62,5 %).
import { perfumes11, noDisponible } from './producto';
import { acordesDe, notasDe } from './clasificacion';

const MAX_ACORDES = 10;
const pesoPos = (i) => 1 / (i + 1);

function perfil(p) {
  const acordes = acordesDe(p);
  const lista = acordes.map((a) => a.clave);
  const etiquetas = new Map(acordes.map((a) => [a.clave, a.etiqueta.toLowerCase()]));
  const vector = new Map(lista.slice(0, MAX_ACORDES).map((c, i) => [c, pesoPos(i)]));
  const norma = Math.sqrt([...vector.values()].reduce((s, v) => s + v * v, 0)) || 1;
  const notas = new Set(notasDe(p).map((n) => n.clave));
  return { lista, etiquetas, vector, norma, notas };
}

function coseno(a, b) {
  let s = 0;
  a.vector.forEach((v, c) => { if (b.vector.has(c)) s += v * b.vector.get(c); });
  return s / (a.norma * b.norma);
}

// Acorde principal de un perfume, como se muestra en la tienda
export function acordePrincipal(p) {
  const pf = perfil(p);
  return pf.lista.length ? pf.etiquetas.get(pf.lista[0]) : null;
}

// [{ p, afinidad (0–100), mismoPrincipal, posicion, acordes: [{ nombre, compartido, principal }] }]
export function perfumesAfines(producto, catalogo, limite = 12, minimo = 6) {
  if (!producto) return [];
  const base = perfil(producto);
  const principal = base.lista[0];
  if (!principal) return [];
  const candidatos = perfumes11(catalogo).filter((p) => p.id !== producto.id && !noDisponible(p));

  const evaluados = candidatos.map((p) => {
    const pf = perfil(p);
    const pos = pf.lista.indexOf(principal);
    const prominencia = pos >= 0 ? pesoPos(pos) : 0;
    const parecido = coseno(base, pf);
    let notas = 0;
    base.notas.forEach((n) => { if (pf.notas.has(n)) notas += 1; });
    return {
      p,
      posicion: pos,
      mismoPrincipal: pos === 0,
      orden: prominencia * 0.75 + parecido * 0.25 + notas * 0.0001,
      afinidad: Math.round((prominencia * 0.75 + parecido * 0.25) * 100),
      acordes: pf.lista.slice(0, 4).map((c) => ({ nombre: pf.etiquetas.get(c), compartido: base.vector.has(c), principal: c === principal }))
    };
  }).sort((a, b) => b.orden - a.orden || a.p.n.localeCompare(b.p.n, 'es'));

  const conPrincipal = evaluados.filter((r) => r.posicion >= 0);
  // Si casi nadie tiene ese acorde (p. ej. oud), se completa con los de perfil más parecido
  const relleno = conPrincipal.length < minimo
    ? evaluados.filter((r) => r.posicion < 0 && r.afinidad > 0).slice(0, minimo - conPrincipal.length)
    : [];
  return [...conPrincipal, ...relleno].slice(0, limite);
}
