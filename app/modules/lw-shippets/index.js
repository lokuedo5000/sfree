const path = require("path");
const fs = require("fs");
const axios = require('axios');

class LW {
    constructor() {

    }
    
    // Json
    async json(method, jsontext, ...arg) {
        if (method === "read") {
            try {
                const data = await fs.promises.readFile(path.join(...arg), 'utf8');
                const result = JSON.parse(data);
                return result;
            } catch (error) {
                console.log({ err: error });
                return { err: error };
            }
        } else if (method === "save") {
            await fs.promises.writeFile(path.join(...arg), JSON.stringify(jsontext));
        } else if (method === "saveStringify") {
            await fs.promises.writeFile(path.join(...arg), JSON.stringify(jsontext, null, 2));
        } else {
            return false;
        }
    }

    allFileJson(carpeta) {
        const archivosJSON = [];

        // Lee el contenido de la carpeta
        const archivos = fs.readdirSync(carpeta);

        archivos.forEach(archivo => {
            // Verifica si el archivo tiene la extensión .json
            if (path.extname(archivo) === '.json') {
                // Lee el contenido del archivo JSON y lo agrega al arreglo archivosJSON
                const archivoPath = path.join(carpeta, archivo);
                const datosJSON = fs.readFileSync(archivoPath, 'utf8');
                const objetoJSON = JSON.parse(datosJSON);

                const idindex = (archivosJSON.length + 1);
                objetoJSON.idindex = idindex;
                archivosJSON.push(objetoJSON);
            }
        });

        return archivosJSON;
    }
    exArray(array, querys) {
        const resultado = {};

        querys.forEach(propiedad => {
            const conjunto = new Set();

            array.forEach(objeto => {
                if (objeto.rawg[propiedad] && Array.isArray(objeto.rawg[propiedad])) {
                    objeto.rawg[propiedad].forEach(item => {
                        if (item !== undefined) {
                            conjunto.add(JSON.stringify(item)); // Convierte a cadena para asegurarse de elementos únicos
                        }
                    });
                }
            });

            resultado[propiedad] = Array.from(conjunto).map(item => JSON.parse(item));
        });

        return resultado;
    }

    async veryUrl(url) {
        try {
            const respuesta = await axios.head(url);
            if (respuesta.status === 200) {
                return true;
            }
            if (respuesta.status === 404) {
                return false;
            }
        } catch (error) {
            return false;
        }
    }

    async deleteFolderFiles(rutaCarpeta) {
        try {
            const archivos = await fs.promises.readdir(rutaCarpeta);

            for (const archivo of archivos) {
                const rutaArchivo = path.join(rutaCarpeta, archivo);
                const stats = await fs.promises.lstat(rutaArchivo);

                if (stats.isDirectory()) {
                    await this.deleteFolderFiles(rutaArchivo);
                } else {
                    await fs.promises.unlink(rutaArchivo);
                }
            }

            await fs.promises.rmdir(rutaCarpeta);
            return true;
        } catch (error) {
            console.error(`Error al eliminar la carpeta ${rutaCarpeta}: ${error.message}`);
            return false;
        }
    }

    async deleteFolder(folder) {
        const rutaCarpetaAEliminar = path.resolve(folder)

        const resp = await this.deleteFolderFiles(rutaCarpetaAEliminar);
        return resp;
    }

    base64ToCadena(cadena) {
        const buffer = Buffer.from(cadena, 'base64');
        return buffer.toString('utf-8');
    }

}

module.exports = LW;