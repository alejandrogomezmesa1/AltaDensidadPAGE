// Migraciones aplicadas en este arranque: las rutas consultan aquí si una parte del
// esquema existe, para funcionar en modo reducido si alguna migración falló.
let aplicadas = new Set();

module.exports = {
    fijar(conjunto) { aplicadas = new Set(conjunto); },
    // 005: ficha de clasificación (marca, original, familia, acordes, notas) y precio en revisión
    clasificacion: () => aplicadas.has('005')
};
