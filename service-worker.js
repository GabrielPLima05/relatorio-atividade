"use strict";


/* =========================================================
   VERSÃO DO CACHE

   IMPORTANTE:
   Sempre que fizermos uma atualização importante
   no aplicativo, aumentaremos esta versão.
========================================================= */

const CACHE_NAME =
    "relatorio-atividade-v2";


/* =========================================================
   ARQUIVOS ESSENCIAIS
========================================================= */

const ARQUIVOS_OFFLINE = [

    "./",

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
                                        nomeCache
                                        !==
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

                        return self.clients.claim();

                    }

                )

        );

    }

);


/* =========================================================
   FUNCIONAMENTO ONLINE / OFFLINE
========================================================= */

self.addEventListener(

    "fetch",

    function (event) {

        if (
            event.request.method
            !==
            "GET"
        ) {

            return;

        }


        event.respondWith(

            caches
                .match(
                    event.request
                )

                .then(

                    function (arquivoCache) {

                        /*
                        Se já estiver no cache,
                        utiliza o arquivo local.
                        */

                        if (
                            arquivoCache
                        ) {

                            return arquivoCache;

                        }


                        /*
                        Se não estiver no cache,
                        tenta buscar pela internet.
                        */

                        return fetch(
                            event.request
                        )

                        .then(

                            function (resposta) {

                                if (
                                    !resposta
                                    ||
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

                        )

                        .catch(

                            function () {

                                /*
                                Se estiver completamente offline
                                e for uma navegação, abre o
                                formulário principal.
                                */

                                if (
                                    event.request.mode
                                    ===
                                    "navigate"
                                ) {

                                    return caches.match(
                                        "./index.html"
                                    );

                                }


                                return new Response(

                                    "Conteúdo indisponível offline.",

                                    {

                                        status:
                                            503,

                                        statusText:
                                            "Offline"

                                    }

                                );

                            }

                        );

                    }

                )

        );

    }

);
