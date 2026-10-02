// Migraciones aplicadas en este arranque: las rutas consultan aquí si una parte del
// esquema existe, para funcionar en modo reducido si alguna migración falló.
let aplicadas = new Set();

module.exports = {
    fijar(conjunto) { aplicadas = new Set(conjunto); },
    // 005: ficha de clasificación (marca, original, familia, acordes, notas) y precio en revisión
    clasificacion: () => aplicadas.has('005'),
    // 006: precios del armador y ficha web de los insumos de DATA
    armador: () => aplicadas.has('006'),
    // 007: vender sin existencias (por producto y kit)
    sinStock: () => aplicadas.has('007'),
    // 008: fragancias solo preparadas (no se venden como 1.1)
    soloPreparado: () => aplicadas.has('008'),
    // 009: ruta fija de cada perfume y referencia en Fragrantica
    enlaces: () => aplicadas.has('009'),
    // 010: varias familias olfativas por perfume
    familias: () => aplicadas.has('010')
};
