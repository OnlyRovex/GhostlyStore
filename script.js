// ============================================
// TYPEWRITER EFFECT
// ============================================
const typewriterPhrases = [
    "Cuentas premium al mejor precio 👻",
    "Juegos originales y garantizados 🎮",
    "Entregas inmediatas 24/7 ⚡",
    "Más de 180 clientes satisfechos ⭐",
    "Tu tienda de confianza 🛡️"
];

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typewriterElement = null;

function typeWriter() {
    typewriterElement = document.getElementById('typewriter-text');
    if (!typewriterElement) return;
    
    const currentPhrase = typewriterPhrases[phraseIndex];
    
    if (isDeleting) {
        typewriterElement.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typewriterElement.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
    }
    
    let typeSpeed = isDeleting ? 30 : 80;
    
    if (!isDeleting && charIndex === currentPhrase.length) {
        typeSpeed = 2000; // Pausa al terminar de escribir
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % typewriterPhrases.length;
        typeSpeed = 500; // Pausa antes de escribir nueva frase
    }
    
    setTimeout(typeWriter, typeSpeed);
}

document.addEventListener('DOMContentLoaded', typeWriter);

// ============================================
// MODAL SOBRE NOSOTROS
// ============================================
const aboutModal = document.getElementById('about-modal');
const aboutLink = document.querySelector('a[href="#about"]');

if (aboutLink) {
    aboutLink.addEventListener('click', function(e) {
        e.preventDefault();
        aboutModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });
}

// ============================================
// MODAL FAQ
// ============================================
const faqModal = document.getElementById('faq-modal');
const faqLink = document.querySelector('a[href="#faq"]');

if (faqLink) {
    faqLink.addEventListener('click', function(e) {
        e.preventDefault();
        faqModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });
}

// ============================================
// MODAL REVIEWS
// ============================================
const reviewsModal = document.getElementById('reviews-modal');
const reviewsLink = document.querySelector('a[href="#reviews"]');

if (reviewsLink) {
    reviewsLink.addEventListener('click', function(e) {
        e.preventDefault();
        reviewsModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });
}

// FAQ Accordion
document.addEventListener('DOMContentLoaded', function() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const isActive = faqItem.classList.contains('active');
            
            // Cerrar todos los demás
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Abrir el actual si no estaba activo
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });
});

// ============================================
// MODAL PRODUCTO
// ============================================
const productoModal = document.getElementById('producto-modal');

// Descripciones personalizadas por producto
const descripcionesProductos = {
    // Crunchyroll Planes
    'PLAN MENSUAL MEGAFAN (Perfil privado)': [
        '› 1 mes de duración.',
        '› Acceso ilimitado a todo el catálogo.',
        '› Calidad Full HD.',
        '› 1 dispositivo simultáneo.',
        '› Sin anuncios.'
    ],
    'PLAN MENSUAL MEGAFAN – CUENTA COMPLETA': [
        '› 1 mes de duración.',
        '› Acceso completo sin límites.',
        '› Full HD / 4K Ultra HD.',
        '› 4 dispositivos simultáneos.',
        '› Descargas sin conexión.',
        '› Sin anuncios.'
    ],
    'PLAN ANUAL MEGAFAN – CUENTA COMPLETA': [
        '› 12 meses de duración (Garantía 3 meses).',
        '› Todos los beneficios del plan mensual completo.',
        '› Mejor precio anual.',
        '› Mayor estabilidad y garantía prolongada.',
        '› Full HD / 4K Ultra HD.',
        '› 4 dispositivos simultáneos.',
        '› Descargas sin conexión.',
        '› Sin anuncios.'
    ],
    // Spotify Planes
    'Spotify Premium – PLAN 1 MES': [
        '› 1 mes de duración (Garantía total).',
        '› Música sin anuncios.',
        '› Saltos ilimitados.',
        '› Descargas para escuchar sin conexión.',
        '› Audio de alta calidad.',
        '› Reproducción en cualquier dispositivo.'
    ],
    'Spotify Premium – PLAN 3 MESES': [
        '› 3 meses de duración (Garantía total).',
        '› Todos los beneficios del plan mensual.',
        '› Mejor precio por más tiempo.',
        '› Escucha sin anuncios garantizada.',
        '› Descargas ilimitadas.',
        '› Acceso completo a Spotify Premium.',
        '› Podcasts exclusivos.',
        '› Audio de alta calidad.'
    ],
    // Paramount+ Planes
    'Paramount+ 1 PERFIL – Mensual': [
        '› 1 mes de duración.',
        '› Acceso completo al catálogo Paramount+.',
        '› 1 perfil exclusivo.',
        '› Calidad HD / Full HD.',
        '› Ideal para uso personal.'
    ],
    'Paramount+ CUENTA COMPLETA – Mensual': [
        '› 1 mes de duración.',
        '› Acceso total a series y películas.',
        '› Compatible con Smart TV, Android, iOS, PC y consolas.',
        '› Calidad HD / Full HD.',
        '› Reproducción estable.'
    ],
    'Paramount+ CUENTA COMPLETA – Anual': [
        '› 12 meses de duración.',
        '› Cuenta completa por 1 año.',
        '› Mayor ahorro frente al plan mensual.',
        '› Acceso total al catálogo Paramount+.',
        '› Calidad HD / Full HD.',
        '› Soporte durante todo el año.'
    ],
    // Apple TV+ Planes
    'Apple TV+ PERFIL PRIVADO – Mensual': [
        '› 1 mes de duración.',
        '› Acceso completo al catálogo Apple TV+.',
        '› Perfil privado (sujeto a disponibilidad).',
        '› Calidad HD / 4K Ultra HD.',
        '› Hasta 6 dispositivos simultáneos.',
        '› Reproducción estable y sin anuncios.',
        '› Ideal para uso personal.'
    ],
    'Apple TV+ CUENTA COMPLETA – Mensual': [
        '› 1 mes de duración.',
        '› Cuenta completa sin restricciones.',
        '› Acceso total a todas las series y películas.',
        '› Calidad HD / 4K Ultra HD.',
        '› 6 dispositivos en simultáneo.',
        '› Compatible con Smart TV, iPhone, Android, PC y consolas.',
        '› Sin anuncios.',
        '› Garantía de activación.'
    ],
    // Viki Rakuten Planes
    'Viki Rakuten PERFIL PRIVADO – Mensual': [
        '› 1 mes de duración.',
        '› Acceso al catálogo completo de Viki Rakuten.',
        '› Calidad HD.',
        '› 1 dispositivo simultáneo.',
        '› Subtítulos en varios idiomas.',
        '› Sin anuncios.',
        '› Ideal para uso personal.'
    ],
    'Viki Rakuten CUENTA COMPLETA – Mensual': [
        '› 1 mes de duración.',
        '› Acceso total a Viki Rakuten Plus.',
        '› Calidad HD.',
        '› Varios dispositivos simultáneos.',
        '› Descargas para ver sin conexión.',
        '› Sin anuncios.',
        '› K-dramas, C-dramas, J-dramas, películas y shows asiáticos.',
        '› Subtítulos rápidos y precisos en múltiples idiomas.',
        '› Compatible con Smart TV, móvil y PC.'
    ],
    // Disney+ Planes
    'Disney+ PERFIL PRIVADO – Mensual': [
        '› 1 mes de duración.',
        '› Acceso al catálogo completo de Disney, Pixar, Marvel, Star Wars y National Geographic.',
        '› Calidad Full HD.',
        '› 1 dispositivo.',
        '› Sin anuncios.'
    ],
    'Disney+ CUENTA COMPLETA – Mensual': [
        '› 1er mes → $11 | Renovación → $10.',
        '› Acceso total sin límites.',
        '› Full HD.',
        '› 4 dispositivos simultáneos.',
        '› Descargas sin conexión.',
        '› Contenido exclusivo y estrenos originales.',
        '› Página web para códigos de inicio de sesión.',
        '› Incluye: Hulu, ESPN, Marvel, Star Wars, Pixar, National Geographic.'
    ],
    // Prime Video Planes
    'Prime Video PERFIL PRIVADO – Mensual': [
        '› 1 mes de duración.',
        '› Acceso al catálogo completo de Prime Video.',
        '› Calidad Full HD.',
        '› 1 dispositivo simultáneo.',
        '› Sin anuncios.'
    ],
    'Prime Video CUENTA COMPLETA – Mensual': [
        '› 1 mes de duración.',
        '› Full HD / 4K Ultra HD.',
        '› 3 dispositivos simultáneos.',
        '› Descargas para ver sin conexión.',
        '› Acceso total a películas, series y Amazon Originals.',
        '› Sin anuncios.'
    ],
    'Prime Video 1 PERFIL – Anual': [
        '› 12 meses de duración (Garantía en ticket).',
        '› Todos los beneficios del plan mensual completo.',
        '› Mejor precio anual.',
        '› Acceso continuo a estrenos y contenido exclusivo.',
        '› Mayor estabilidad y garantía prolongada.'
    ],
    // HBO Max Planes
    'HBO Max PERFIL PRIVADO – Mensual': [
        '› 1 mes de duración.',
        '› Full HD.',
        '› 1 dispositivo simultáneo.',
        '› Acceso a todo el catálogo.',
        '› La cuenta puede ser Estándar o Platino.',
        '› Sin anuncios.'
    ],
    'HBO Max CUENTA COMPLETA – Mensual': [
        '› 1 mes de duración.',
        '› Full HD / 4K Ultra HD.',
        '› 2 dispositivos simultáneos.',
        '› Descargas sin conexión.',
        '› Acceso completo sin límites.',
        '› La cuenta puede ser Estándar o Platino.',
        '› Sin anuncios.'
    ],
    'HBO Max CUENTA COMPLETA – Anual': [
        '› 12 meses de duración (Garantía de activación).',
        '› Todos los beneficios del plan completo mensual.',
        '› Mejor precio anual.',
        '› Garantía y estabilidad prolongada.',
        '› Acceso continuo a estrenos exclusivos.',
        '› La cuenta puede ser Estándar o Platino.'
    ],
    // YouTube Premium Planes
    'YouTube Premium – PLAN 1 MES': [
        '› 1 mes de duración.',
        '› Sin anuncios en todos los videos.',
        '› Reproducción en segundo plano.',
        '› Descargas para ver sin conexión.',
        '› Acceso a YouTube Music Premium.',
        '› Calidad Full HD / 4K (según contenido).'
    ],
    'YouTube Premium – PLAN 3 MESES': [
        '› 3 meses de duración.',
        '› Todos los beneficios del plan mensual.',
        '› Mejor precio por más tiempo.',
        '› Reproducción sin anuncios garantizada por 3 meses.',
        '› Acceso completo a YouTube Premium + YouTube Music.'
    ],
    // Fortnite Pavos
    '1.000 Pavos': [
        '› 1.000 V-Bucks para tu cuenta.',
        '› Entrega inmediata.',
        '› Compra 100% segura.'
    ],
    '2.800 Pavos': [
        '› 2.800 V-Bucks para tu cuenta.',
        '› Entrega inmediata.',
        '› Compra 100% segura.'
    ],
    '5.000 Pavos': [
        '› 5.000 V-Bucks para tu cuenta.',
        '› Entrega inmediata.',
        '› Compra 100% segura.'
    ],
    '13.500 Pavos': [
        '› 13.500 V-Bucks para tu cuenta.',
        '› Entrega inmediata.',
        '› Compra 100% segura.'
    ],
    'Fortnite Crew (Via Login)': [
        '› Todos los pases + Crew Pack.',
        '› Crew Styles + Rocket Pass.',
        '› 1.000 V-Bucks incluidos.',
        '› Entrega via login.'
    ],
    // Free Fire
    'Pase Elite': [
        '› Pase Elite completo.',
        '› Todas las recompensas.',
        '› Entrega inmediata.'
    ],
    // Otros - CapCut Pro
    'CapCut Pro – PLAN 1 MES': [
        '› 1 mes de duración (Garantía total).',
        '› Acceso a todas las funciones premium de CapCut Pro.',
        '› Miles de plantillas premium y diseños exclusivos.',
        '› Imágenes, íconos y elementos ilimitados.',
        '› Exportación en alta resolución (4K) sin límites.',
        '› Herramientas avanzadas (filtros, fondos, eliminación de fondo).',
        '› Almacenamiento en la nube y sincronización.',
        '› Trabajo en equipo en tiempo real.',
        '› Sin marcas de agua.',
        '› Sin anuncios.'
    ],
    // Otros - Canva Pro
    'Canva Pro PERMANENTE': [
        '› Acceso permanente a Canva Pro.',
        '› Miles de plantillas premium y diseños exclusivos.',
        '› Imágenes, íconos y elementos ilimitados.',
        '› Exportación en alta resolución (4K).',
        '› Herramientas avanzadas (filtros, fondos, eliminación de fondo).',
        '› Almacenamiento en la nube y sincronización.',
        '› Trabajo en equipo en tiempo real.',
        '› Sin marcas de agua.',
        '› Garantía total en la suscripción.'
    ],
    // Otros - OnlyFans
    'OnlyFans Cuenta $50 Saldo': [
        '› Cuenta con $50 de saldo recargado.',
        '› Duración: 12 – 24 horas.',
        '› Suscríbete a cualquier cuenta.',
        '› Descarga todo el contenido.',
        '› Cuenta lista para usar.'
    ],
    'OnlyFans Cuenta $100 Saldo': [
        '› Cuenta con $100 de saldo recargado.',
        '› Duración: 12 – 24 horas.',
        '› Suscríbete a cualquier cuenta.',
        '› Descarga todo el contenido.',
        '› Cuenta lista para usar.'
    ],
    // Otros - Brazzers
    'Brazzers – ANUAL': [
        '› Acceso completo a la plataforma premium.',
        '› Contenido exclusivo y actualizado.',
        '› Experiencia fluida y optimizada.',
        '› Funciones premium habilitadas.',
        '› Sin restricciones de uso.'
    ],
    // Otros - PornHub
    'PornHub Premium – ANUAL': [
        '› Acceso a cuenta con PornHub Premium.',
        '› Contenido Premium.',
        '› Descarga el contenido.',
        '› Sin límites de dispositivos.',
        '› Sin anuncios y experiencia fluida.'
    ]
};

document.addEventListener('DOMContentLoaded', function() {
    // Event listener para botones de comprar
    const botonesComprar = document.querySelectorAll('.btn-comprar');
    
    botonesComprar.forEach(boton => {
        boton.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const card = this.closest('.producto-card');
            const nombre = card.querySelector('.producto-nombre').textContent;
            const precio = card.querySelector('.producto-precio').textContent;
            const imagen = card.querySelector('.skin-img').src;
            
            // Actualizar modal con info del producto
            document.getElementById('modal-producto-nombre').textContent = nombre;
            document.getElementById('modal-producto-precio').textContent = precio;
            document.getElementById('modal-imagen-principal').src = imagen;
            
            // Actualizar thumbnail
            const thumb = document.querySelector('.thumb-img');
            if (thumb) {
                thumb.src = imagen;
            }
            
            // Verificar si tiene imagen hover
            const imgElement = card.querySelector('.skin-img');
            const modalImg = document.getElementById('modal-imagen-principal');
            const modalThumb = document.querySelector('.thumb-img');
            
            if (imgElement.dataset.hover) {
                // Añadir segunda thumbnail
                const thumbsContainer = document.querySelector('.producto-modal-thumbs');
                thumbsContainer.innerHTML = `
                    <img src="${imgElement.dataset.original}" alt="Thumb 1" class="thumb-img active" data-img="${imgElement.dataset.original}">
                    <img src="${imgElement.dataset.hover}" alt="Thumb 2" class="thumb-img" data-img="${imgElement.dataset.hover}">
                `;
                
                // Event listeners para thumbnails
                const thumbs = thumbsContainer.querySelectorAll('.thumb-img');
                thumbs.forEach(t => {
                    t.addEventListener('click', function() {
                        thumbs.forEach(th => th.classList.remove('active'));
                        this.classList.add('active');
                        modalImg.style.transition = 'opacity 0.3s ease';
                        modalImg.style.opacity = '0';
                        setTimeout(() => {
                            modalImg.src = this.dataset.img;
                            modalImg.style.opacity = '1';
                        }, 150);
                    });
                });
            } else {
                // Resetear a una sola thumbnail
                const thumbsContainer = document.querySelector('.producto-modal-thumbs');
                thumbsContainer.innerHTML = `<img src="${imagen}" alt="Thumb 1" class="thumb-img active">`;
            }
            
            // Actualizar descripción según el producto
            const featuresList = document.querySelector('.modal-producto-features');
            if (featuresList) {
                // Buscar descripción personalizada o usar default
                const descripcion = descripcionesProductos[nombre] || [
                    '› Producto de calidad garantizada.',
                    '› Compra segura y confiable.'
                ];
                
                featuresList.innerHTML = descripcion.map(item => `<li>${item}</li>`).join('');
            }
            
            // Mostrar modal
            productoModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    });
});

// ============================================
// CERRAR MODALES
// ============================================
const modalCloses = document.querySelectorAll('.modal-close');

modalCloses.forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
        this.closest('.modal').style.display = 'none';
        document.body.style.overflow = 'auto';
    });
});

window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = 'auto';
    }
});

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

// Función para manejar la compra
function handlePurchase() {
    alert('¡Gracias por tu interés! Contacta con nosotros en nuestras redes sociales.');
}

// Función para filtrar productos por categoría
function filterProducts(category, buttonElement) {
    // Obtener todas las tarjetas de productos
    const cards = document.querySelectorAll('.producto-card');
    const buttons = document.querySelectorAll('.categoria-btn');
    
    // Remover clase active de todos los botones
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Agregar clase active al botón clickeado
    buttonElement.classList.add('active');
    
    // Mostrar/ocultar productos según categoría
    cards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        
        if (category === 'all' || cardCategory === category) {
            card.style.display = 'block';
            // Animación de entrada
            card.style.animation = 'fadeIn 0.5s ease-in';
        } else {
            card.style.display = 'none';
        }
    });
}

// ============================================
// SMOOTH SCROLL PARA NAVEGACIÓN
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ============================================
// ANIMACIÓN AL HACER SCROLL
// ============================================
window.addEventListener('scroll', () => {
    const productSection = document.querySelector('.product-section');
    const productosSection = document.querySelector('.productos-section');
    
    // Animación para la sección Best Seller
    if (productSection) {
        const rect = productSection.getBoundingClientRect();
        
        if (rect.top < window.innerHeight && rect.bottom >= 0) {
            productSection.style.opacity = '1';
            productSection.style.transform = 'translateY(0)';
        }
    }
    
    // Animación para la sección Productos
    if (productosSection) {
        const rect = productosSection.getBoundingClientRect();
        
        if (rect.top < window.innerHeight - 100) {
            productosSection.style.opacity = '1';
            productosSection.style.transform = 'translateY(0)';
        }
    }
});

// ============================================
// EVENT LISTENERS PARA BOTONES DE CATEGORÍA
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Agregar event listeners a los botones de categoría
    const categoryButtons = document.querySelectorAll('.categoria-btn');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            filterProducts(category, this);
        });
    });
    
    // Event listener para el botón de compra
    const buyButton = document.querySelector('.buy-button');
    if (buyButton) {
        buyButton.addEventListener('click', handlePurchase);
    }
    
    // Event listeners para las redes sociales
    const socialLinks = document.querySelectorAll('.social-links a');
    socialLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const social = this.getAttribute('title');
            alert(`Redirigiendo a ${social}...`);
            // Aquí puedes agregar los links reales de tus redes sociales
        });
    });
});

// ============================================
// ANIMACIÓN PARA LAS TARJETAS DE PRODUCTOS
// ============================================
const productCards = document.querySelectorAll('.producto-card');

productCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// ============================================
// EFECTO PARALLAX SUAVE EN EL HEADER
// ============================================
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const header = document.querySelector('header');
    
    if (scrolled > 50) {
        header.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.5)';
    } else {
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    }
});

// ============================================
// EFECTO HOVER EN IMAGEN MINECRAFT2
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const hoverImages = document.querySelectorAll('img[data-hover]');
    
    hoverImages.forEach(img => {
        // Añadir transición CSS
        img.style.transition = 'opacity 0.3s ease';
        
        img.addEventListener('mouseenter', function() {
            this.style.opacity = '0';
            setTimeout(() => {
                this.src = this.dataset.hover;
                this.style.opacity = '1';
            }, 150);
        });
        
        img.addEventListener('mouseleave', function() {
            this.style.opacity = '0';
            setTimeout(() => {
                this.src = this.dataset.original;
                this.style.opacity = '1';
            }, 150);
        });
    });
});

// ============================================
// CONSOLE LOG DE BIENVENIDA
// ============================================
console.log('%c¡Bienvenido a GhostlyStore! 👻', 'color: #b794f6; font-size: 20px; font-weight: bold;');
console.log('%cSitio web desarrollado con HTML, CSS y JavaScript', 'color: #667eea; font-size: 14px;');

// ============================================
// PARTÍCULAS ANIMADAS
// ============================================
function createParticles() {
    const container = document.getElementById('particles-container');
    if (!container) return;
    
    const particleCount = 150;
    const colors = ['white', 'purple', 'blue'];
    
    // Crear estrellas fijas que parpadean
    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star ' + colors[Math.floor(Math.random() * colors.length)];
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.width = (Math.random() * 3 + 1) + 'px';
        star.style.height = star.style.width;
        star.style.animationDuration = (Math.random() * 3 + 2) + 's';
        star.style.animationDelay = Math.random() * 5 + 's';
        container.appendChild(star);
    }
    
    // Crear partículas flotantes
    function createFloatingParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle ' + colors[Math.floor(Math.random() * colors.length)];
        particle.style.left = Math.random() * 100 + '%';
        particle.style.width = (Math.random() * 4 + 2) + 'px';
        particle.style.height = particle.style.width;
        particle.style.animationDuration = (Math.random() * 15 + 10) + 's';
        
        container.appendChild(particle);
        
        // Eliminar partícula después de la animación
        setTimeout(() => {
            particle.remove();
        }, parseFloat(particle.style.animationDuration) * 1000);
    }
    
    // Crear partículas iniciales
    for (let i = 0; i < 30; i++) {
        setTimeout(() => createFloatingParticle(), i * 200);
    }
    
    // Crear nuevas partículas continuamente
    setInterval(createFloatingParticle, 500);
}

// Iniciar partículas cuando cargue la página
document.addEventListener('DOMContentLoaded', createParticles);