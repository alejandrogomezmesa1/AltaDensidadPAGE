import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import GappedSquareModuleDrawer
from qrcode.image.styles.colormasks import HorizontalGradiantColorMask

def generate_qr(url, filename="instagram_qr.png"):
    qr = qrcode.QRCode(
        version=5, # Mantenemos buen tamaño
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    # Creamos la imagen con estilos más elegantes sin logo
    img = qr.make_image(
        image_factory=StyledPilImage,
        module_drawer=GappedSquareModuleDrawer(), # Cuadros con ligera separación
        color_mask=HorizontalGradiantColorMask( 
            back_color=(255, 255, 255), 
            left_color=(131, 58, 180),  # Morado oscuro de Instagram a la izquierda
            right_color=(253, 29, 29)   # Rojo/Fucsia a la derecha
        )
    )
    
    img.save(filename)
    print(f"QR code successfully saved to {filename}")

if __name__ == "__main__":
    # Cambia esta URL por tu link de Instagram real
    instagram_url = "https://www.instagram.com/fragancias_alta_densidad/" 
    generate_qr(instagram_url)
