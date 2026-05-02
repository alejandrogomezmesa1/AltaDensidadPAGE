
import os

path = r'c:\AltaDensidadPAGE\assets\js\carrito.js'

with open(path, 'rb') as f:
    raw_data = f.read()

# Buscamos el patron de error común y lo reemplazamos por un guion normal
# â\x80\x94 es el dash en UTF-8 mal interpretado
content = raw_data.decode('latin-1', errors='ignore')

# Limpiar el texto de Mercado Pago (buscando la parte corrupta que se ve en la captura)
# Reemplazamos cualquier cosa rara entre "ahora" y "Mercado Pago"
import re
content = re.sub(r'Pagar ahora.*?Mercado Pago', 'Pagar ahora — Mercado Pago', content)

# Asegurar la funcion pedirPorWhatsApp
wa_func = """
// Funcion para abrir WhatsApp en nueva pestaña
function pedirPorWhatsApp(url) {
    if (!url) return;
    window.open(url, "_blank");
}
"""

# Si ya existe, la limpiamos, si no, la añadimos al final
if "function pedirPorWhatsApp" in content:
    content = re.sub(r'function pedirPorWhatsApp\(url\)\s*\{.*?\}', wa_func.strip(), content, flags=re.DOTALL)
else:
    content = content.strip() + "\n\n" + wa_func

# Corregir la asignación del evento en renderCarrito para que sea más robusta
# Buscaremos donde se asigna el click a btnCarritoWA
old_event = """const btnWA = document.getElementById("btnCarritoWA");
  if (btnWA) {
    btnWA.addEventListener("click", () => {"""

# Guardar como UTF-8 puro (BOM-less)
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Super Reparación completada.")
