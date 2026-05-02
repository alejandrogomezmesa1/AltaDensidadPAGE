
import os

path = r'c:\AltaDensidadPAGE\assets\js\carrito.js'

with open(path, 'rb') as f:
    data = f.read().decode('latin-1', errors='ignore')

# 1. Definir la funcion pedirPorWhatsApp al final (limpia)
pedir_func = """
function pedirPorWhatsApp(url) {
    if (!url) return;
    console.log("Iniciando redireccion WhatsApp...");
    window.open(url, "_blank");
}
"""

# 2. Reconstruir el renderCarrito con strings limpios (Unicode escapes para emojis)
# !Hola! \uD83D\uDC4B (👋)
# \u2022 (•)
# \uD83D\uDCA0 (*) -> No, * es normal
# \uD83D\uDCAA -> no
# \uD83D\uDCA1 -> no
# \uD83D\uDE10 -> no
# \uD83D\uDE80 (\uD83D\uDE80) (🚀)
# \uD83D\uDCB0 (\uD83D\uDCB0) (💰)

header_msg = "\\u00A1Hola! \\uD83D\\uDC4B Acabo de armar mi pedido en la web:"
footer_msg = "\\uD83D\\uDCB0 *Total:* $"
end_msg = "Me gustar\\u00EDa coordinar el pago y el env\\u00EDo. \\uD83D\\uDE80"

# Vamos a reemplazar todo el bloque de generacion del mensaje
import re

# Primero limpiamos los caracteres basura que vimos en el view_file
data = re.sub(r'ÃƒÂ¢Ã‚Â€Ã‚Â¢', '\\u2022', data)
data = re.sub(r'ÃƒÂ‚Ã‚Â¡Hola! ÃƒÂ°Ã‚ÂŸÃ‚Â‘Ã‚Â‹', header_msg, data)
data = re.sub(r'ÃƒÂ°Ã‚ÂŸÃ‚Â’Ã‚Â° \*Total:\*', footer_msg, data)
data = re.sub(r'Me gustarÃƒÂƒÃ‚Â­a coordinar el pago y el envÃƒÂƒÃ‚Â­o. ÃƒÂ°Ã‚ÂŸÃ‚ÂšÃ‚Â€', end_msg, data)

# Tambien corregir el Mercado Pago si quedo algo raro
data = re.sub(r'Pagar ahora.*?Mercado Pago', 'Pagar ahora - Mercado Pago', data)

# Asegurar que no hay duplicados de pedirPorWhatsApp
data = re.sub(r'function pedirPorWhatsApp\(url\)\s*\{.*?\}', '', data, flags=re.DOTALL)
data = data.strip() + "\n\n" + pedir_func

with open(path, 'w', encoding='utf-8') as f:
    f.write(data)

print("Reconstrucción total con Unicode completada.")
