const { app, BrowserWindow, dialog } = require('electron');

const path = require("path");
const fs = require("fs");

const LW = require("./app/modules/lw-shippets");
const lw = new LW();

const ImgminifyDown = require("imgminify-down");
const imgminifydown = new ImgminifyDown();



// Torrent Hash
const TorrentHash = require("./app/modules/torrent-hash");
const torrenthash = new TorrentHash();

// Database
const Database = require("../../../container/database");
const db = new Database();

// Download
const DownloadsFiles = require("./app/modules/downloads-files");
const downloadsfiles = new DownloadsFiles();

const UtilNode = require("../../../data/apps/modules/utilnode");
const utilnode = new UtilNode({
    electron: { dialog, BrowserWindow },
    database: db
});

// ZipEx
const ZipEx = require('../../../container/zipex');
const zipex = new ZipEx();

// Save info
const NewSave = require('./app/modules/save-info-game');
const newinfo = new NewSave();

// libraries
const lib = require("../modules/util-libraries");

// download info
async function doFiles() {
    if (newinfo.fileall > 0) {
        // getAll DB
        let articles = await utilnode.getTable("articles", "games", ["id"]);
        for (const item of articles) {
            const namefile = utilnode.clearSymbols(item.name, "namefile");
            const pathfile = path.join(__dirname, "app", "public", "json", "save", `${namefile}.json`);

            if (!fs.existsSync(pathfile)) {
                await newinfo.downloadWikiRawg(item.hash, {
                    wikiID: item.apiwiki,
                    rawgID: item.apirawg,
                    nameImg: path.join(__dirname, "app", "public", "downloads", "banners", `banner_${namefile}.jpg`),
                    nameJson: pathfile
                });
            }

        }
    }
}

async function setFolders() {
    await utilnode.veryFolderAndCrator([
        {
            name: "db",
            path: path.join(__dirname, "app")
        },
        {
            name: "temp",
            path: path.join(__dirname, "app")
        },
        {
            name: "downloads",
            path: path.join(__dirname, "app", "public")
        },
        {
            name: "banners",
            path: path.join(__dirname, "app", "public", "downloads")
        },
        {
            name: "json",
            path: path.join(__dirname, "app", "public")
        },
        {
            name: "save",
            path: path.join(__dirname, "app", "public", "json")
        }
    ]);
}

const routes = [
    {
        method: 'get',
        path: '/',
        handler: (req, res) => {
            // render
            res.render(path.join(__dirname, "app", "views", "home"));
        }
    },
    {
        method: 'get',
        path: '/games',
        handler: (req, res) => {
            // render
            res.render(path.join(__dirname, "app", "views", "games"));
        }
    },
    {
        method: 'get',
        path: '/view',
        handler: async (req, res) => {
            // querys
            let qs = req.query;
            let view = await utilnode.whereDB('articles', 'games', { hash: `${qs.where}` });
            // get info
            const namefile = utilnode.clearSymbols(view[0].name, "namefile");

            let info = utilnode.fsSystem("read", __dirname, "app", "public", "json", "save", `${namefile}.json`);
            const infoParse = JSON.parse(info);
            // render
            res.render(path.join(__dirname, "app", "views", "view"), {
                view: view[0],
                info: infoParse,
                filename: namefile
            });
        }
    },
    {
        method: 'get',
        path: '/update',
        handler: async (req, res) => {
            try {
                await setFolders();
                await downloadsfiles.download({
                    url: "https://lokuedo5000.github.io/lwte/sfree/sfree_info.zip",
                    outputDirectory: path.join(__dirname, "app", "temp")
                });

                await zipex.extractZip({
                    zipFilePath: path.join(__dirname, "app", "temp", "sfree_info.zip"),
                    extractPath: path.join(__dirname, "app", "db")
                });

                // open db
                await db.db("articles", path.join(__dirname, "app", "db", "articles.lw"));

                // getAll DB
                let articles = await utilnode.getTable("articles", "games", ["id"]);

                // Utiliza Promise.all para mapear las promesas
                const promises = articles.map(async (item) => {
                    const namefile = utilnode.clearSymbols(item.name, "namefile");
                    const pathfile = path.join(__dirname, "app", "public", "json", "save", `${namefile}.json`);

                    if (!fs.existsSync(pathfile)) {
                        newinfo.addCountFile(1);
                    }
                });

                // Espera a que todas las promesas se completen
                await Promise.all(promises);

                res.redirect('/init');
            } catch (error) {
                res.send("download failed.")
            }

        }
    },
    {
        method: 'post',
        path: '/download-data',
        handler: async (req, res) => {
            doFiles();
            res.end();
        }
    },
    {
        method: 'post',
        path: '/info-download',
        handler: async (req, res) => {
            if (newinfo.fileall === 0) {
                res.json({
                    progress: parseInt(1.0)
                })
            } else {
                const ratio = (newinfo.fileok / newinfo.fileall);
                const tolerance = 0.0001;
                res.json({
                    progress: Math.abs(ratio - 1) < tolerance ? parseInt(1.0) : ratio.toFixed(2)
                })
            }


        }
    },
    {
        method: 'get',
        path: '/init',
        handler: async (req, res) => {

            // render
            res.render(path.join(__dirname, "app", "views", "update"));

        }
    },
    {
        method: 'get',
        path: '/stop-all-process',
        handler: (req, res) => {
            let qs = req.query;
            if (qs.active) {
                console.log("finalizar procesos");
            }

            res.end();
        }
    },
    {
        method: 'get',
        path: '/infohash',
        handler: async (req, res) => {
            let qs = req.query;

            const folder = await torrenthash.getFolderAsync();

            if (folder) {
                try {
                    const response = await torrenthash.saveTorrentFile(folder, qs.name, qs.torrent, lw.base64ToCadena(qs.magnet), (1000 * 30));
                    if (response.message == "torrent_file_successfully") {
                        await lw.deleteFolder(response.path);
                        res.send(".torrent file saved successfully");
                    } else {
                        res.send("Something went wrong");
                    }
                } catch (error) {
                    res.send("Something went wrong");
                }
            } else {
                res.send("The .torrent download was canceled");
            }
        }
    },
    {
        method: 'post',
        path: '/veryimg',
        handler: async (req, res) => {
            console.log(req.body.url);
            try {
                let very = await lw.veryUrl(req.body.url);
                res.json({ very });
            } catch (error) {
                res.json({ err: error });
            }
        }
    },
    {
        method: 'post',
        path: '/db',
        handler: async (req, res) => {
            let body = req.body;
            let articles = [];

            if (body.type == "all") {
                articles = await utilnode.getTable("articles", "games", ["id"]);
            } else if (body.type == "all-az") {
                articles = await utilnode.getTable("articles", "games", ["az", "name"]);
            } else if (body.type == "all-za") {
                articles = await utilnode.getTable("articles", "games", ["za", "name"]);
            } else if (body.type == "all-desc") {
                articles = await utilnode.getTable("articles", "games", ["desc"]);
            } else if (body.type == "desc-limit") {
                articles = await utilnode.getTable("articles", "games", ["desc-limit", body.limitdata]);
            }
            res.json(articles)

        }
    },
    {
        method: 'get',
        path: '/svg/*',
        handler: async (req, res) => {
            const contentType = "image/svg+xml";

            res.writeHead(200, { "Content-Type": contentType });

            const filePath = path.join(
                __dirname,
                `${req.params[0]}.svg`

            );
            const readStream = fs.createReadStream(filePath);

            readStream.pipe(res);
        }
    },
    {
        method: 'post',
        path: '/save/:method',
        handler: async (req, res) => {
            try {

                const { json, jsonPath, name = false } = req.body;


                if (req.params.method === "json") {

                    await fs.promises.writeFile(path.join(__dirname, jsonPath), JSON.stringify(json, null, 2));


                    res.send(true);
                } else if (req.params.method === "jsonnoexist") {

                    if (name) {

                        await lw.json("saveStringify", json, __dirname, jsonPath);

                        res.send(true);
                    } else {
                        res.send(false);
                    }
                } else if (req.params.method === "jsonco") {

                    if (name) {
                        let pk = await lw.json("read", null, __dirname, "app", "public", "json", "rawg.json");
                        pk[name] = json;
                        await lw.json("save", pk, __dirname, "app", "public", "json", "rawg.json");
                        res.send(true);
                    } else {
                        res.send(false);
                    }
                } else {

                    res.status(400).send("Método no válido");
                }
            } catch (error) {
                // Manejar errores
                console.error(error);
                res.status(500).send("Error al guardar los datos en el archivo JSON");
            }
        }
    },
    {
        method: 'post',
        path: '/download/:method',
        handler: async (req, res) => {
            // body
            let body = req.body;
            // open
            let pk = await lw.json("read", null, __dirname, "package.json");
            const nameFolder = path.dirname(__dirname);
            const nameFile = path.join(nameFolder, pk.name, "app", "public", "downloads", "banners", body.banner);

            if (req.params.method == "download") {

                const save = await imgminifydown.download("download", {
                    url: body.urlBanner,
                    dest: nameFile,
                    optimize: true, // Puedes establecer esto en true o false según tus necesidades
                });

                res.send({ resp: save });
            }

        }
    },
    {
        method: 'post',
        path: '/all-json',
        handler: async (req, res) => {
            let jsonall = lw.allFileJson(path.join(__dirname, "app", "public", "json", "save"));
            res.send(JSON.stringify(jsonall));
        }
    },
    {
        method: 'post',
        path: '/tagsandgenres',
        handler: async (req, res) => {
            let jsonall = lw.allFileJson(path.join(__dirname, "app", "public", "json", "save"));
            res.send(lw.exArray(jsonall, ["genres", "tags"]));
        }
    },
    {
        method: 'get',
        path: '/file/*',
        handler: async (req, res) => {
            //   let referer = req.headers.referer || req.headers.referrer;
            //   let ar = referer.split("/");

            const extName = path.extname(req.params[0]);

            // Tipos de contenido
            const contentTypes = {
                ".css": "text/css",
                ".js": "text/javascript",
                ".json": "application/json",
                ".png": "image/png",
                ".ico": "image/x-icon",
                ".jpg": "image/jpeg",
                ".svg": "image/svg+xml",
                ".mp3": "audio/mpeg", // Tipo de contenido para archivos mp3
                ".mp4": "video/mp4", // Tipo de contenido para archivos mp4
            };

            const contentType = contentTypes[extName] || "text/html";

            res.writeHead(200, { "Content-Type": contentType });


            // open
            let pk = await lw.json("read", null, __dirname, "package.json");
            const nameFolder = path.dirname(__dirname);
            const nameFile = path.join(nameFolder, pk.name, req.params[0]);

            const readStream = fs.createReadStream(nameFile);

            readStream.pipe(res);
        }
    }

];

module.exports = [...routes, ...lib];
