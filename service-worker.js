"use strict";


/* =========================================================
   VERSÃO
========================================================= */

const CACHE_NAME =
    "relatorio-atividade-v5";


/* =========================================================
   ARQUIVOS ESSENCIAIS
========================================================= */

const ARQUIVOS_OFFLINE = [

    "./index.html",

    "./manifest.json",

    "./icons/icon.png"

];


/* =========================================================
   INSTALAÇÃO
========================================================= */

self.addEventListener(
    "install",
    function (event) {

        event.waitUntil(

            caches
                .open(
                    CACHE_NAME
                )

                .then(
                    function (cache) {

                        return cache.addAll(
                            ARQUIVOS_OFFLINE
                        );

                    }
                )

        );


        /*
         * Não espera o Service Worker antigo
         * ser encerrado.
         */

        self.skipWaiting();

    }
);


/* =========================================================
   ATIVAÇÃO
========================================================= */

self.addEventListener(
    "activate",
    function (event) {

        event.waitUntil(

            caches
                .keys()

                .then(
                    function (nomesCaches) {

                        return Promise.all(

                            nomesCaches.map(
                                function (nomeCache) {

                                    if (
                                        nomeCache !==
                                        CACHE_NAME
                                    ) {

                                        return caches.delete(
                                            nomeCache
                                        );

                                    }

                                }
                            )

                        );

                    }
                )

                .then(
                    function () {

                        /*
                         * Assume imediatamente o controle
                         * das páginas abertas.
                         */

                        return self.clients.claim();

                    }
                )

        );

    }
);


/* =========================================================
   FETCH
========================================================= */

self.addEventListener(
    "fetch",
    function (event) {

        if (
            event.request.method !==
            "GET"
        ) {

            return;

        }


        /*
         * =============================================
         * NAVEGAÇÃO / HTML
         *
         * INTERNET PRIMEIRO
         * CACHE COMO RESERVA
         * =============================================
         */

        if (
            event.request.mode ===
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
                    function (resposta) {

                        /*
                         * Guarda a versão nova
                         * do HTML no cache.
                         */

                        const copia =
                            resposta.clone();


                        caches
                            .open(
                                CACHE_NAME
                            )

                            .then(
                                function (cache) {

                                    cache.put(
                                        "./index.html",
                                        copia
                                    );

                                }
                            );


                        return resposta;

                    }
                )

                .catch(
                    function () {

                        /*
                         * Sem internet:
                         * usa a última versão armazenada.
                         */

                        return caches.match(
                            "./index.html"
                        );

                    }
                )

            );


            return;

        }


        /*
         * =============================================
         * DEMAIS ARQUIVOS
         *
         * CACHE PRIMEIRO
         * INTERNET COMO RESERVA
         * =============================================
         */

        event.respondWith(

            caches
                .match(
                    event.request
                )

                .then(
                    function (arquivoCache) {

                        if (
                            arquivoCache
                        ) {

                            return arquivoCache;

                        }


                        return fetch(
                            event.request
                        )

                        .then(
                            function (resposta) {

                                if (
                                    !resposta ||
                                    resposta.status !== 200
                                ) {

                                    return resposta;

                                }


                                const copia =
                                    resposta.clone();


                                caches
                                    .open(
                                        CACHE_NAME
                                    )

                                    .then(
                                        function (cache) {

                                            cache.put(
                                                event.request,
                                                copia
                                            );

                                        }
                                    );


                                return resposta;

                            }
                        );

                    }
                )

        );

    }
);
