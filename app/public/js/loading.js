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

kit.onDOMReady(async () => {
    var circle = cacheapp.newProgressBar("update", ".precarga", "Circle", {
        color: "#d81b60",
        trailColor: "#e8eaf6",
        trailWidth: 10,
        strokeWidth: 10
    });
    circle.animate(1, {
        duration: 1500,
    }, async () => {
        await _ajax("/download-data", "POST", {});

        circle.destroy();
        cacheapp.newProgressBar("delete", "update");
        kit.hide(".precarga", 100);
        kit.show(".precarga-download", 100);


        var lineBar = cacheapp.newProgressBar("download", ".precarga-download", "Line", {
            color: "#d81b60",
            trailColor: "#e8eaf6",
            trailWidth: 1,
            strokeWidth: 2,
        });

        kit.createInterval("download", async () => {
            const allApps = await _ajax("/info-download", "POST", {});
            if (allApps.progress === 1) {
                kit.removeInterval("download");
            }

            lineBar.animate(allApps.progress, {
                duration: 1000
            }, () => {
                if (allApps.progress === 1) {
                    window.location.href = "/";
                }
            });

        }, 500);



    })
})

