
import os

path = r'c:\AltaDensidadPAGE\assets\js\carrito.js'

with open(path, 'rb') as f:
    data = f.read()

# Intentar decodificar con latin-1 que acepta cualquier byte
content = data.decode('latin-1')

# Corregir la funcion de WhatsApp
bad_wa = 'window.open(url, " _blank\\);'
good_wa = 'window.open(url, "_blank");'
content = content.replace(bad_wa, good_wa)

# Corregir Mercado Pago
bad_mp = '"Pagar ahora ?" Mercado Pago"'
good_mp = '"Pagar ahora \u2014 Mercado Pago"'
content = content.replace(bad_mp, good_mp)

# Guardar como UTF-8 limpio
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Reparación de carrito.js completada.")
