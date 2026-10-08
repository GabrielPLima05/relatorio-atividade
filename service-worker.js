const CACHE_NAME =
    "relatorio-atividade-v6-3";


const ARQUIVOS_OFFLINE = [

    "./",

    "./index.html",

    "./manifest.json",

    "./icons/icon.png",

    "./libs/jspdf.umd.min.js"

];



self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches
                .open(
                    CACHE_NAME
                )

                .then(
                    cache => {

                        return cache.addAll(
                            ARQUIVOS_OFFLINE
                        );

                    }
                )

                .then(
                    () => {

                        return self.skipWaiting();

                    }
                )

        );

    }
);



self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches
                .keys()

                .then(
                    nomesCaches => {

                        return Promise.all(

                            nomesCaches.map(
                                nome => {

                                    if (
                                        nome
                                        !==
                                        CACHE_NAME
                                    ) {

                                        return caches.delete(
                                            nome
                                        );

                                    }

                                }
                            )

                        );

                    }
                )

                .then(
                    () => {

                        return self.clients.claim();

                    }
                )

        );

    }
);



self.addEventListener(
    "fetch",
    event => {

        if (
            event.request.method
            !==
            "GET"
        ) {

            return;

        }




        if (
            event.request.mode
            ===
            "navigate"
        ) {

            event.respondWith(

                fetch(
                    event.request,
                    {
                        cache:
                            "no-store"
                    }
                )

                .then(
                    response => {

                        const copia =
                            response.clone();


                        caches
                            .open(
                                CACHE_NAME
                            )

                            .then(
                                cache => {

                                    cache.put(
                                        "./index.html",
                                        copia
                                    );

                                }
                            );


                        return response;

                    }
                )

                .catch(
                    () => {

                        return caches.match(
                            "./index.html"
                        );

                    }
                )

            );


            return;

        }



        event.respondWith(

            caches
                .match(
                    event.request
                )

                .then(
                    cached => {

                        if (
                            cached
                        ) {

                            return cached;

                        }


                        return fetch(
                            event.request
                        )

                        .then(
                            response => {

                                if (
                                    !response
                                    ||
                                    response.status
                                    !==
                                    200
                                ) {

                                    return response;

                                }


                                const copia =
                                    response.clone();


                                caches
                                    .open(
                                        CACHE_NAME
                                    )

                                    .then(
                                        cache => {

                                            cache.put(
                                                event.request,
                                                copia
                                            );

                                        }
                                    );


                                return response;

                            }
                        );

                    }
                )

        );

    }
);



self.addEventListener(
    "message",
    event => {

        if (
            event.data
            ===
            "SKIP_WAITING"
        ) {

            self.skipWaiting();

        }

    }
);
