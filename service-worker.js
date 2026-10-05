"use strict";


/* =========================================================
   NOME E VERSÃO DO CACHE
========================================================= */

const CACHE_NAME =
    "relatorio-atividade-v1";



/* =========================================================
   ARQUIVOS NECESSÁRIOS PARA FUNCIONAMENTO OFFLINE
========================================================= */

const ARQUIVOS_OFFLINE = [

    "./",

    "./index.html",

    "./manifest.json",

    "./icons/icon.png"

];



/* =========================================================
   INSTALAÇÃO DO SERVICE WORKER
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
   INTERCEPTAR REQUISIÇÕES
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
                        Se o arquivo já estiver salvo
                        offline, utiliza o cache.
                        */

                        if (
                            arquivoCache
                        ) {

                            return arquivoCache;

                        }


                        /*
                        Caso contrário,
                        tenta buscar na internet.
                        */

                        return fetch(
                            event.request
                        )

                        .then(

                            function (resposta) {

                                /*
                                Não armazenamos respostas
                                inválidas.
                                */

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
                                Se estiver offline e for uma
                                navegação, volta para o formulário.
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