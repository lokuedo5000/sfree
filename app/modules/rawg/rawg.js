const axios = require('axios');

class RawgAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    createArray(array, opts) {

        const resultado = array.map(objeto => {
            const nuevoObjeto = {};
            opts.forEach(propiedad => {
                if (objeto.hasOwnProperty(propiedad)) {
                    nuevoObjeto[propiedad] = objeto[propiedad];
                }
            });
            return nuevoObjeto;
        });



        return resultado;
    }

    async getGameInfoById(gameId) {
        try {
            const apiUrl = `https://api.rawg.io/api/games/${gameId}?key=${this.apiKey}`;
            const response = await axios.get(apiUrl);

            if (response.status === 200) {
                const gameData = response.data;
                return {
                    id: gameData.id,
                    name: gameData.name,
                    description: gameData.description || "wiki",
                    rating: gameData.rating || "no",
                    releaseDate: gameData.released || "no",
                    updated: gameData.updated || "no",
                    developers: this.createArray(gameData.developers, ["name", "slug"]),
                    genres: this.createArray(gameData.genres, ["name", "slug"]),
                    publishers: this.createArray(gameData.publishers, ["name", "slug"]),
                    saturated_color: gameData.saturated_color,
                    tags: this.createArray(gameData.tags, ["name", "slug"]),
                    updated: gameData.updated,
                    background_image: gameData.background_image,
                    dominant_color: gameData.dominant_color,
                    ratings: gameData.ratings || [],
                    platforms: gameData.platforms || [],
                    metacritic_platforms: gameData.metacritic_platforms || [],
                    stores: gameData.stores || [],
                    developers: this.createArray(gameData.developers, ["name", "slug", "image_background"]) || []
                };
            } else {
                return false;
                // throw new Error(`No se pudo obtener la información del juego (ID: ${gameId})`);
            }
        } catch (error) {
            throw error;
        }
    }
}

module.exports = RawgAPI;