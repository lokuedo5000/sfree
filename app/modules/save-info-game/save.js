const path = require("path");
const fs = require("fs");

// RawG
const RawgAPI = require('../rawg');
const apiKey = 'f22f8bfa1fc8493dbc156b4683edbf15';
const rawg = new RawgAPI(apiKey);

// Wikipedia
const Wiki = require('../wikipedia');
const wiki = new Wiki();

// Img Save
const ImgminifyDown = require("imgminify-down");
const imgminifydown = new ImgminifyDown();


class NewSave {
    constructor() {
        this.fileall = 0;
        this.fileok = 0;
    }

    addCountFile(num) {
        this.fileall = (this.fileall + num)
    }
    addCountFileOk(num) {
        this.ok = (this.ok + num)
    }

    async downloadWikiRawg(hash, { wikiID, rawgID, nameImg, nameJson }) {
        let result = {};

        let wi = await wiki.getPageInfoById(wikiID);
        let raw = await rawg.getGameInfoById(rawgID);

        if (wi && raw) {
            result.id = (this.fileok + 1);
            result.hash = hash;
            result["wiki"] = wi;
            result["rawg"] = raw;
            
            if (!fs.existsSync(nameImg)) {
                await imgminifydown.download("download", {
                    url: raw.background_image,
                    dest: nameImg,
                    optimize: true,
                });
            }
            
        }


        await fs.promises.writeFile(nameJson, JSON.stringify(result, null, 2));

        this.fileok = (this.fileok + 1);

    }
}

module.exports = NewSave;