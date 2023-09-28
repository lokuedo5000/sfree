const { BrowserWindow, dialog } = require("electron");

const path = require("path");
const fs = require("fs");

const WebTorrent = require('webtorrent');
const parseTorrent = require('parse-torrent');

class TorrentHash {
    constructor() {
        this.clients = {};
    }

    newClient(clientId) {
        const client = this.clients[clientId];
        if (client) {
            return client;
        } else {
            this.clients[clientId] = new WebTorrent();
            return this.clients[clientId];
        }
    }

    destroyClient(clientId) {
        const client = this.clients[clientId];
        if (client) {
            client.destroy(() => {
                delete this.clients[clientId];
            });
        }
    }

    async download(savein, infohash, torrentUrl) {
        const client = this.newClient(savein);

        try {
            const torrent = await client.add(torrentUrl, {
                path: path.join(savein, infohash) // Directory to save the torrent files
            });

            torrent.on('done', () => {
                console.log('Torrent download finished');
                // You can add your own code here for what to do when the download is finished
            });
        } catch (error) {
            console.error('Error downloading torrent:', error);
        }
    }

    async saveTorrentFile(savein, name, hash, magnet, timeoutMilliseconds) {
        const client = this.newClient(hash);

        let magnetSet = parseTorrent(magnet);

        magnetSet.name = name;

        let magnetLink = parseTorrent.toMagnetURI(magnetSet);

        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error('Tiempo de espera agotado para la descarga del archivo .torrent.'));
                this.destroyClient(hash); // Cancelar la descarga si se excede el tiempo de espera
            }, timeoutMilliseconds);

            client.add(magnetLink, {
                path: savein,
                skip: true, // Evita descargar el contenido
                timeout: timeoutMilliseconds // Tiempo de espera en milisegundos
            }, (torrent) => {
                clearTimeout(timeoutId); // Cancelar el temporizador si la descarga comienza
                if (torrent && torrent.torrentFile) {
                    try {
                        // Obtener los trackers del torrent y agregarlos al objeto torrentFile
                        const trackers = torrent.announce;
                        let torrentFile = torrent.torrentFile;

                        if (trackers && trackers.length > 0) {
                            torrentFile.announce = trackers;
                        }

                        let magnetInfo = parseTorrent(magnetLink);

                        torrentFile.name = magnetInfo.name;

                        const torrentFilePath = path.join(savein, magnetInfo.name + '.torrent');
                        fs.writeFileSync(torrentFilePath, torrentFile);


                        this.destroyClient(hash);
                        resolve({
                            message: 'torrent_file_successfully',
                            path: path.join(savein, torrent.name)
                        });
                    } catch (error) {
                        this.destroyClient(hash);
                        reject(new Error('Algo salió mal'));
                    }
                } else {
                    this.destroyClient(hash);
                    reject(new Error('El archivo .torrent no se pudo descargar.'));
                }
            });
        });
    }

    async getFolderAsync() {
        const result = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
            properties: ['openDirectory']
        });

        if (!result.canceled) {
            return result.filePaths[0];
        }
        return null;
    }
}
module.exports = TorrentHash;