
import os
import re

path = r'c:\AltaDensidadPAGE\assets\js\carrito.js'

with open(path, 'rb') as f:
    data = f.read().decode('latin-1', errors='ignore')

# 1. Limpiar Mercado Pago (usar guion normal)
data = re.sub(r'Pagar ahora.*?Mercado Pago', 'Pagar ahora - Mercado Pago', data)

# 2. Corregir el renderCarrito para usar onclick directo en WhatsApp
# Esto evita problemas de addEventListener si el DOM tarda en actualizar
wa_btn_pattern = r'<button id="btnCarritoWA".*?Pedir por WhatsApp\s*</button>'
# Necesitamos capturar el bloque entero de renderCarrito para modificarlo bien
# Pero mejor hagamos un reemplazo mas especifico de la logica de vinculacion

# 3. Asegurar que pedirPorWhatsApp sea global y use window.open
wa_func = """
function pedirPorWhatsApp(url) {
    if (!url) return;
    console.log("Abriendo WhatsApp:", url);
    const win = window.open(url, "_blank");
    if (!win) {
        // Si el bloqueador de popups lo impide, redirigir en la misma pestaña
        window.location.href = url;
    }
}
"""

if "function pedirPorWhatsApp" in data:
    data = re.sub(r'function pedirPorWhatsApp\(url\)\s*\{.*?\}', wa_func.strip(), data, flags=re.DOTALL)
else:
    data = data.strip() + "\n\n" + wa_func

# 4. Forzar el texto de Mercado Pago en todas sus apariciones
data = data.replace('Pagar ahora \u2014 Mercado Pago', 'Pagar ahora - Mercado Pago')

with open(path, 'w', encoding='utf-8') as f:
    f.write(data)

print("Limpieza final completada con guiones simples.")
