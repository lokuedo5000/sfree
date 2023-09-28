const path = require("path");
const fs = require("fs");
const http = require('http');
const https = require('https');
const moment = require('moment');

class DownloadsFiles {
    constructor() {
        // this.downloadPromise = this.download(url, outputDirectory);
    }

    async download({url, outputDirectory, rename = false}) {
        return new Promise((resolve, reject) => {
            const nameID = Buffer.from(url).toString('base64');

            let protocol = https;
            if (url.startsWith('http://')) {
                protocol = http;
            }

            protocol.get(url, (response) => {
                let nameFile = path.basename(url);
                if (rename) {
                    nameFile = rename;
                }
                if (response.statusCode === 200) {
                    const filePath = path.join(outputDirectory, nameFile);
                    const fileStream = fs.createWriteStream(filePath);
                    response.pipe(fileStream);

                    fileStream.on('finish', () => {
                        fileStream.close();
                        resolve(filePath);
                    });

                    fileStream.on('error', (error) => {
                        reject(error);
                    });
                } else {
                    reject(new Error(`Failed to download: ${url}`));
                }
            }).on('error', (error) => {
                reject(error);
            });


        });
    }

    // Interval
    createInterval(name, callback, intervalTime) {
        if (this.intervals[name] == undefined) {
            const interval = setInterval(callback, intervalTime);
            this.intervals[name] = interval;
            return interval;
        }
    }

    pauseInterval(name) {
        const interval = this.intervals[name];
        if (interval) {
            clearInterval(interval);
        }
    }

    removeInterval(name) {
        const interval = this.intervals[name];
        if (interval) {
            this.pauseInterval(name);
            delete this.intervals[name];
        }
    }
}

module.exports = DownloadsFiles;
