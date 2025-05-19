document.addEventListener('DOMContentLoaded', function() {
    // Cambiar imagen principal al hacer clic en miniaturas
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.getElementById('main-product-image');
    
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', function() {
            // Remover clase active de todas las miniaturas
            thumbnails.forEach(t => t.classList.remove('active'));
            
            // Añadir clase active a la miniatura clickeada
            this.classList.add('active');
            
            // Cambiar imagen principal
            const newImageSrc = this.getAttribute('data-image');
            mainImage.src = newImageSrc;
            mainImage.alt = this.alt;
        });
    });
    
    // Configurar botón de WhatsApp
    const whatsappBtn = document.getElementById('whatsapp-order-btn');
    
    whatsappBtn.addEventListener('click', function() {
        const selectedSize = document.querySelector('input[name="size"]:checked').value;
        const selectedPackaging = document.querySelector('input[name="packaging"]:checked').value;
        
        let message = `¡Hola! Estoy interesado en comprar:\n\n`;
        message += `*Producto:* Coco Channel\n`;
        message += `*Tamaño:* ${document.querySelector(`input[name="size"]:checked + .option-name`).textContent}\n`;
        message += `*Envase:* ${document.querySelector(`input[name="packaging"]:checked + .option-name`).textContent}\n\n`;
        message += `Por favor, necesito más información sobre disponibilidad y formas de pago.`;
        
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/573046450389?text=${encodedMessage}`;
        
        window.open(whatsappUrl, '_blank');
    });
    
    // Efecto hover para las opciones
    const options = document.querySelectorAll('.option');
    
    options.forEach(option => {
        option.addEventListener('mouseenter', function() {
            if (!this.querySelector('input').checked) {
                this.style.borderColor = '#e63946';
                this.style.backgroundColor = '#fff5f5';
            }
        });
        
        option.addEventListener('mouseleave', function() {
            if (!this.querySelector('input').checked) {
                this.style.borderColor = '#ddd';
                this.style.backgroundColor = '#fff';
            }
        });
        
        // Cambiar estilo cuando se selecciona
        const radio = option.querySelector('input[type="radio"]');
        radio.addEventListener('change', function() {
            if (this.checked) {
                options.forEach(opt => {
                    opt.style.borderColor = '#ddd';
                    opt.style.backgroundColor = '#fff';
                });
                this.parentElement.style.borderColor = '#e63946';
                this.parentElement.style.backgroundColor = '#fff5f5';
            }
        });
    });
});