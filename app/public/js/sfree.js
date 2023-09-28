function _ajax(url, method, data) {
    return new Promise((resolve, reject) => {
        kit.send({
            url: url,
            method: method,
            data,
            success: (respuesta) => {
                resolve(respuesta);
            },
            error: (codigo, respuesta) => {
                reject({ codigo, respuesta });
            }
        });
    });
}

function _search(array, obj, value) {
    const resultados = array.filter((elemento) => {
        return elemento[obj] === value;
    });
    return resultados;
}

function clearSymbols(text, type) {
    const invalidCharacters = /[~“#%&*:<>\?\/\\{|}'´\*\+`']/g;
    const cleanedText = text.replace(invalidCharacters, '');

    switch (type) {
        case "namefile":
            return cleanedText.replace(/\s+/g, '_').toLowerCase();

        case "toLowerCase":
            return cleanedText.toLowerCase();

        case "toUpperCase":
            return cleanedText.toUpperCase();

        default:
            return cleanedText;
    }
}

async function getTagsGenresObj() {
    let response = await _ajax("/tagsandgenres", "POST", {});
    return response;
}

function remText(text, replacements) {
    for (const key in replacements) {
        if (replacements.hasOwnProperty(key)) {
            const replacement = replacements[key];
            const regex = new RegExp(key, 'g');
            text = text.replace(regex, replacement);
        }
    }
    return text;
}

async function getByTags(tag, jsonData) {
    try {
        const juegos = jsonData || [];


        if (tag) {
            const allJsonData = await _ajax("/all-json", "POST", {});
            const allJson = allJsonData;

            const juegosFiltrados = allJson.filter((juego) => {
                const tags = juego.rawg.tags || [];
                const genres = juego.rawg.genres || [];

                const uniqueCombined = [...tags, ...genres].map(tag => tag.slug);

                return uniqueCombined.includes(tag.replace(/-ene-/g, "ñ"));
            });

            const promises = juegosFiltrados.map(async (juegoFiltrado) => {
                const resultado = juegos.find((juego) => juego.hash === juegoFiltrado.hash);
                return resultado;
            });

            const resultados = await Promise.all(promises);
            return resultados.filter(resultado => resultado); // Filtra resultados nulos
        } else {
            return juegos;
        }
    } catch (error) {
        console.error("Error en la búsqueda de juegos:", error);
        return [];
    }
}

function query() {
    const params = new URLSearchParams(new URL(window.location.href).search);
    const queryParams = {};

    for (const [key, value] of params) {
        if (queryParams[key]) {
            if (Array.isArray(queryParams[key])) {
                queryParams[key].push(value);
            } else {
                queryParams[key] = [queryParams[key], value];
            }
        } else {
            queryParams[key] = value;
        }
    }

    return queryParams;
}

function owlRun(selector) {
    owlL.newOwl(selector, {
        items: 5,
        loop: true,
        margin: 10,
        stagePadding: 20,
        autoplay: true,
        autoplayTimeout: 5000,
        autoplayHoverPause: true,
        responsive: {
            0: {
                items: 1,
            },
            600: {
                items: 3,
            },
            1450: {
                items: 4,
            },
            1500: {
                items: 5,
            }
        }
    });

}

function veryDatePremiere(datenow, releaseDate) {
    // Convierte la fecha de lanzamiento del juego en un objeto Date
    const fechaLanzamiento = new Date(releaseDate);

    // Calcula la fecha después de 6 meses
    const fecha6MesesDespués = new Date(fechaLanzamiento);
    fecha6MesesDespués.setMonth(fechaLanzamiento.getMonth() + 6);

    // Compara la fecha actual con la fecha después de 6 meses
    if (datenow >= fecha6MesesDespués) {
        return false;
    } else {
        return true;
    }
}

kit.onDOMReady(async () => {
    // Menu Left
    kit.addEvent('.open-menu-left', 'click', (e) => {

        kit.qsSelector(false, e.target.dataset.menu, (e) => {
            const veryClass = kit.hasClass(".menu-left", "menu-left-active");

            if (!veryClass) {
                e.style.left = 0;
                e.classList.add("menu-left-active");
            } else {
                e.style.left = -e.offsetWidth + "px";
                e.classList.remove("menu-left-active");
            }

        });




    });

    kit.addEvent('.menu-left', 'click', (e) => {
        const menu = e.currentTarget;
        const menuWidth = menu.offsetWidth;
        const menuHeight = menu.offsetHeight;

        const menuRect = menu.getBoundingClientRect();

        const clickX = e.clientX - menuRect.left;
        const clickY = e.clientY - menuRect.top;

        if (clickX >= 0 && clickX <= menuWidth && clickY >= 0 && clickY <= menuHeight) {
        } else {
            menu.classList.remove('menu-left-active');
            menu.style.left = -menuWidth + "px";
        }
    });




    kit.existsElm(".id-home", async () => {

        // veryDatePremiere
        // Cragar Juegos
        let getGames = await _ajax("/db", "POST", { type: "desc-limit", limitdata: 5 });

        let thecolors = {
            "exceptional": "green darken-2",
            "recommended": "light-blue darken-4",
            "meh": "orange darken-2",
            "skip": "red accent-3"
        };

        let replacements = {
            "exceptional": "Excelente",
            "recommended": "Recomendado",
            "meh": "Promedio",
            "skip": "No Recomendado"
        };

        const carouselItems = kit.qsSelector(false, "#carousel-news");
        carouselItems.innerHTML = "";
        for (const item of getGames) {
            carouselItems.innerHTML += `<div class="carousel-item brown lighten-4 white-text df-center-x app-x-banner"
                                            style="background-image: url(/downloads/banners/banner_${clearSymbols(item.name, "namefile")}.jpg);" href="#${clearSymbols(item.name, "namefile")}!">
                                        </div>`;
        }

        carouselItems.classList.add("carousel", "carousel-slider");


        $('.carousel.carousel-slider').carousel({
            fullWidth: true,
            indicators: true
        });

        // Estrenos y mas
        let all = await _ajax("/db", "POST", { type: "all-desc" });

        const fechaActual = new Date();

        // estrenos
        let estr = parseInt(0);
        let etr = kit.qsSelector(false, ".owl-estrenos");
        for (const estreno of all) {
            let info = await _ajax(`/json/save/${clearSymbols(estreno.name, "namefile")}.json`, "GET");
            if (veryDatePremiere(fechaActual, info.rawg.releaseDate)) {
                etr.innerHTML += `<div class="item">
                                    <div class="cover-art" style="background-image: url(/downloads/banners/banner_${clearSymbols(estreno.name, "namefile")}.jpg)">
                                    <div class="by_info_home orange darken-3">Estreno</div>
                                    <a href="/view?where=${estreno.hash}" class="name-art">${estreno.name}</a>
                                    </div>
                                </div>`
                ++estr
            }
        }

        if (estr > 0) {
            etr.classList.add("owl-carousel", "owl-theme");
            owlRun(".owl-estrenos")
        }

        // excelentes & recomendados
        let excl = parseInt(0);
        let exl = kit.qsSelector(false, ".owl-excelentes");

        let recm = parseInt(0);
        let rem = kit.qsSelector(false, ".owl-recomendados");

        for (const excelente of all) {
            let info = await _ajax(`/json/save/${clearSymbols(excelente.name, "namefile")}.json`, "GET");
            let exceptional = _search(info.rawg.ratings, "title", "exceptional")[0] || { "percent": 0 };
            let recommended = _search(info.rawg.ratings, "title", "recommended")[0] || { "percent": 0 };
            let meh = _search(info.rawg.ratings, "title", "meh")[0] || { "percent": 0 };
            let skip = _search(info.rawg.ratings, "title", "skip")[0] || { "percent": 0 };

            // Inicialmente, asumimos que el valor máximo es exceptional.percent
            let maxRating = { category: exceptional.title, hash: excelente.hash, exceptional };
            let maxValue = exceptional.percent;

            // Comparamos con recommended.percent
            if (recommended.percent > maxValue) {
                maxRating = { category: recommended.title, hash: excelente.hash, recommended };
                maxValue = recommended.percent;
            }

            // Comparamos con meh.percent
            if (meh.percent > maxValue) {
                maxRating = { category: meh.title, hash: excelente.hash, meh };
                maxValue = meh.percent;
            }

            // Comparamos con skip.percent
            if (skip.percent > maxValue) {
                maxRating = { category: skip.title, hash: excelente.hash, skip };
            }

            if (maxRating.category == "exceptional") {
                exl.innerHTML += `<div class="item">
                                       <div class="cover-art" style="background-image: url(/downloads/banners/banner_${clearSymbols(excelente.name, "namefile")}.jpg)">
                                       <div class="by_info_home ${remText(maxRating.category, thecolors)}">${remText(maxRating.category, replacements)}</div>
                                       <a href="/view?where=${excelente.hash}" class="name-art">${excelente.name}</a>
                                       </div>
                                   </div>`
                ++excl;
            }

            if (maxRating.category == "recommended") {
                rem.innerHTML += `<div class="item">
                                       <div class="cover-art" style="background-image: url(/downloads/banners/banner_${clearSymbols(excelente.name, "namefile")}.jpg)">
                                       <div class="by_info_home ${remText(maxRating.category, thecolors)}">${remText(maxRating.category, replacements)}</div>
                                       <a href="/view?where=${excelente.hash}" class="name-art">${excelente.name}</a>
                                       </div>
                                   </div>`
                ++recm;
            }
        }

        if (excl > 0) {
            exl.classList.add("owl-carousel", "owl-theme");
            owlRun(".owl-excelentes")
        }

        if (recm > 0) {
            rem.classList.add("owl-carousel", "owl-theme");
            owlRun(".owl-recomendados")
        }

        // kit.show("#carousel-news", 1000);

        // owlRun()

    });

    kit.existsElm("#list-arts", async () => {
        // Cragar Juegos
        let getGames = await _ajax("/db", "POST", { type: "all-az" });

        let showGames = getGames;

        let qs = query();
        if (Object.keys(qs).length > 0) {
            if (qs.tag) {
                let resultTag = await getByTags(qs.tag, getGames);
                showGames = resultTag;
            }
            if (qs.search) {

            }

        }
        const renderPageData = async data => {
            const dataContainer = document.getElementById('list-arts');
            dataContainer.innerHTML = '';

            for (const item of data) {

                let getInfo = await _ajax(`/json/save/${clearSymbols(item.name, "namefile")}.json`, "GET");

                let exceptional = _search(getInfo.rawg.ratings, "title", "exceptional")[0] || { "percent": 0 };
                let recommended = _search(getInfo.rawg.ratings, "title", "recommended")[0] || { "percent": 0 };
                let meh = _search(getInfo.rawg.ratings, "title", "meh")[0] || { "percent": 0 };
                let skip = _search(getInfo.rawg.ratings, "title", "skip")[0] || { "percent": 0 };

                // Inicialmente, asumimos que el valor máximo es exceptional.percent
                let maxRating = exceptional;
                let maxValue = exceptional.percent;

                // Comparamos con recommended.percent
                if (recommended.percent > maxValue) {
                    maxRating = recommended;
                    maxValue = recommended.percent;
                }

                // Comparamos con meh.percent
                if (meh.percent > maxValue) {
                    maxRating = meh;
                    maxValue = meh.percent;
                }

                // Comparamos con skip.percent
                if (skip.percent > maxValue) {
                    maxRating = skip;
                }

                let replacements = {
                    "exceptional": "Excelente",
                    "recommended": "Recomendado",
                    "meh": "Promedio",
                    "skip": "No Recomendado"
                };

                let thecolors = {
                    "exceptional": "green darken-2",
                    "recommended": "light-blue darken-4",
                    "meh": "orange darken-2",
                    "skip": "red accent-3"
                };


                dataContainer.innerHTML += `<div class="view-col">
                                        <div class="view-container-body z-depth-2">
                                            <div class="view-icono" style="background-image: url(/downloads/banners/banner_${clearSymbols(item.name, "namefile")}.jpg)">
                                            <div class="is_ratings">
                                                <div class="is_active"></div>
                                                <div class="is_text ${remText(maxRating.title, thecolors)}">${remText(maxRating.title, replacements)}</div>
                                            </div>
    
                                            
                                            <div class="art-ratings-progress indigo lighten-5">
                                                <a href="#" class="by_info">Rawg.io</a>
                                                <div class="progress-ratings exceptional-progress green darken-2 tooltipped" style="width: ${exceptional.percent}%;" data-position="top" data-tooltip="${remText(exceptional.title || "no", replacements)} ${exceptional.count}"></div>
                                                <div class="progress-ratings recommended-progress light-blue darken-4 tooltipped" style="width: ${recommended.percent}%;" data-position="top" data-tooltip="${remText(recommended.title || "no", replacements)} ${recommended.count}"></div>
                                                <div class="progress-ratings meh-progress orange darken-2 tooltipped" style="width: ${meh.percent}%;" data-position="top" data-tooltip="${remText(meh.title || "no", replacements)} ${meh.count}"></div>
                                                <div class="progress-ratings skip-progress red accent-3 tooltipped" style="width: ${skip.percent}%;" data-position="top" data-tooltip="${remText(skip.title || "no", replacements)} ${skip.count}"></div>
                                            </div>
                                            </div>
                                            <a href="/view?where=${item.hash}" class="name-data">${item.name}</a>
                                        </div>
                                       </div>`;
                if (M.AutoInit) {
                    M.AutoInit()
                }

            }


        }

        $('#pagination-home').pagination({
            dataSource: showGames,
            pageSize: 12,
            callback: function (data, pagination) {
                renderPageData(data);
            }
        });
    })

    kit.existsElm(".view-left", async () => {
        // generos y tags
        let gntg = await getTagsGenresObj();
        // origin
        let pathname = location.pathname.slice(1).split("/");
        let lastItem = pathname[pathname.length - 1];
        // Tags
        const scrollTags = document.querySelector("#tags-scroll-infinite");
        const elmTags = document.querySelector("#tags-scroll-infinite");
        new InfiniteScroll(scrollTags, gntg.tags, 15, elmTags, async (data, i) => {
            if (lastItem == "games") {
                return `<li><a href="?tag=${data.slug.replace(/\s+/g, "-").replace(/ñ/g, "-ene-").toLowerCase()}">${data.name}</a></li>`;
            } else {
                return `<li><a href="/games?tag=${data.slug.replace(/\s+/g, "-").replace(/ñ/g, "-ene-").toLowerCase()}">${data.name}</a></li>`;
            }

        });

        // Tags
        const scrollGenres = document.querySelector("#genres-scroll-infinite");
        const elmGenres = document.querySelector("#genres-scroll-infinite");
        new InfiniteScroll(scrollGenres, gntg.genres, 15, elmGenres, async (data, i) => {

            if (lastItem == "games") {
                return `<li><a href="?tag=${data.slug.replace(/\s+/g, "-").replace(/ñ/g, "-ene-").toLowerCase()}">${data.name}</a></li>`;
            } else {
                return `<li><a href="/games?tag=${data.slug.replace(/\s+/g, "-").replace(/ñ/g, "-ene-").toLowerCase()}">${data.name}</a></li>`;
            }

        });
    })

    kit.existsElm(".page-view", async () => {
        let replacements = {
            "exceptional": "Excelente",
            "recommended": "Recomendado",
            "meh": "Promedio",
            "skip": "No Recomendado"
        };

        let thecolors = {
            "exceptional": "#388e3c ",
            "recommended": "#01579b",
            "meh": "#f57c00",
            "skip": "#ff1744"
        };

        let progress = kit.qsSelector("all", ".container-progress");


        for (const prs of progress) {
            let name_score = prs.getAttribute("data-name");
            var pr = cacheapp.newProgressBar(name_score, prs, "Line", {
                color: remText(name_score, thecolors),
                trailColor: "transparent",
                strokeWidth: 3.5,
                trailWidth: 3,
                svgStyle: { height: '100%' }
            });

            const percent = prs.getAttribute("data-percent");
            pr.animate(Math.abs((percent / 100).toFixed(2)), {
                duration: 1500,
            })
        }

        kit.qsSelector("all", ".pre-line-js", (evn) => {
            for (const elm of evn) {
                elm.innerHTML = elm.innerHTML.trim();
            }

        })

        // Dominantes
        const colorThief = new ColorThief();
        const banner = document.querySelector('#banner-dominantes');
        if (banner.complete) {
            let co = colorThief.getColor(banner);
            kit.qsSelector(false, "#menu-app").style.backgroundColor = `${kit.rgbToHex(...co)}`;
        }
    })

})
