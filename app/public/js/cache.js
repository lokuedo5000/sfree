class CacheApp {
    constructor() {
        this.cache = {};
        this.progressbar = {};
    }
    updateCache(name, data) {
        if (!this.cache[name]) {
            this.cache[name] = {};
        }
        this.cache[name] = data
    }

    newProgressBar(name, selector, typeProgress, options) {
        if (name === "delete") {
            if (this.progressbar[selector]) {
                delete this.progressbar[selector];
            }
            return;
        }
        if (!this.progressbar[name]) {

            this.progressbar[name] = new ProgressBar[typeProgress](selector, {
                color: options.color || 'white',
                strokeWidth: options.strokeWidth || 10,
                trailWidth: options.trailWidth || 10,
                trailColor: options.trailColor || 'black',
                easing: options.easing || 'easeInOut',
            });

            return this.progressbar[name];
        } else {
            return this.progressbar[name];
        }

    }
}

const cacheapp = new CacheApp();