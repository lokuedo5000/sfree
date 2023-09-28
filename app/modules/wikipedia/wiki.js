const axios = require('axios');

class Wiki {
    constructor() { }

    async getPageInfoById(pageId, languages = ['es', 'en', 'fr', 'de']) {
        let pageInfo = null;

        for (const lang of languages) {
            try {
                const apiUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&prop=info|extracts&pageids=${pageId}&exintro=1&explaintext=1`;
                const response = await axios.get(apiUrl);

                if (response.status === 200) {
                    const pageData = response.data.query.pages[pageId];
                    pageInfo = {
                        title: pageData.title,
                        pageId: pageData.pageid,
                        snippet: pageData.extract || "",
                        fullUrl: `https://${lang}.wikipedia.org/wiki/${pageData.title.replace(/ /g, '_')}`
                    };

                    break; // Si encontramos información en este idioma, detenemos la búsqueda.
                }
            } catch (error) {
                
            }
        }

        if (!pageInfo) {
            return false;
        }

        return pageInfo;
    }
}

module.exports = Wiki;
