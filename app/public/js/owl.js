class Owl {
    constructor($) {
        this.$ = $;
        this.owls = {};
        this.defaultOptions = {
            items: 3,
            autoplay: false,
            loop: false,
            // Otras opciones predeterminadas
        };

        // Configurar eventos táctiles como pasivos globalmente
        this.setupPassiveTouchEvents();
    }

    // Función para configurar eventos táctiles como pasivos globalmente
    setupPassiveTouchEvents() {
        const $ = this.$;
        $.event.special.touchstart = {
            setup: function(_, ns, handle) {
                this.addEventListener("touchstart", handle, { passive: !ns.includes("noPreventDefault") });
            }
        };
        $.event.special.touchmove = {
            setup: function(_, ns, handle) {
                this.addEventListener("touchmove", handle, { passive: !ns.includes("noPreventDefault") });
            }
        };
    }

    newOwl(name, userOptions) {
        const $ = this.$;
        const mergedOptions = { ...this.defaultOptions, ...userOptions };
        if (!this.owls[name]) {
            // Crea un nuevo carrusel si no existe
            const newOwl = $(name).owlCarousel(mergedOptions); // Debes pasar el selector y las opciones fusionadas

            // Agrega event listeners utilizando jQuery con opción pasiva
            newOwl.on('touchstart', this.handleTouchStart.bind(this));
            newOwl.on('touchmove', this.handleTouchMove.bind(this));

            this.owls[name] = newOwl;
            return newOwl;
        } else {
            // Devuelve el carrusel existente
            return this.owls[name];
        }
    }

    destroyOwl(name) {
        if (this.owls[name]) {
            // Destruye el carrusel si existe
            this.owls[name].trigger('destroy.owl.carousel').removeClass('owl-carousel owl-loaded');

            // Remueve los event listeners de jQuery
            this.owls[name].off('touchstart', this.handleTouchStart);
            this.owls[name].off('touchmove', this.handleTouchMove);

            delete this.owls[name];
        }
    }

    // Función para manejar el inicio del toque
    handleTouchStart(event) {
        // Obtén la posición inicial del toque
        this.touchStartX = event.touches[0].clientX;
    }

    // Función para manejar el movimiento del toque
    handleTouchMove(event) {
        // Verifica si se ha registrado una posición inicial
        if (typeof this.touchStartX === 'undefined') {
            return;
        }

        // Calcula la distancia del desplazamiento
        const touchEndX = event.touches[0].clientX;
        const touchDeltaX = touchEndX - this.touchStartX;

        // Determina la dirección del desplazamiento
        if (touchDeltaX > 0) {
            // Desplazamiento hacia la derecha
            // Puedes personalizar la lógica para retroceder en el carrusel aquí
        } else if (touchDeltaX < 0) {
            // Desplazamiento hacia la izquierda
            // Puedes personalizar la lógica para avanzar en el carrusel aquí
        }

        // Limpia la posición inicial
        delete this.touchStartX;
    }
}

// Uso de la clase Owl
const owlL = new Owl(jQuery); // Pasamos jQuery como argumento
