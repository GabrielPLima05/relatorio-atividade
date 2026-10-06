"use strict";

/* =========================================================
   RELATÓRIO DE REALIZAÇÃO DE ATIVIDADE
   SERVICE WORKER
   VERSÃO 6.0
========================================================= */


/* =========================================================
   CONFIGURAÇÃO DO CACHE
========================================================= */

const CACHE_NAME =
    "relatorio-atividade-v6";


/*
 * Arquivos necessários para o aplicativo
 * funcionar offline.
 */

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

        console.log(
            "[Service Worker V6] Instalando..."
        );


        event.waitUntil(

            caches
                .open(
                    CACHE_NAME
                )

                .then(
                    function (cache) {

                        console.log(
                            "[Service Worker V6] Salvando arquivos offline..."
                        );


                        return cache.addAll(
                            ARQUIVOS_OFFLINE
                        );

                    }
                )

                .then(
                    function () {

                        console.log(
                            "[Service Worker V6] Arquivos armazenados."
                        );

                    }
                )

        );


        /*
         * Faz a nova versão assumir o controle
         * sem esperar o Service Worker antigo
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

        console.log(
            "[Service Worker V6] Ativando..."
        );


        event.waitUntil(

            caches
                .keys()

                .then(
                    function (nomesCaches) {

                        return Promise.all(

                            nomesCaches.map(
                                function (nomeCache) {

                                    /*
                                     * Apaga caches antigos:
                                     *
                                     * v1
                                     * v2
                                     * v3
                                     * v4
                                     * v5
                                     * etc.
                                     */

                                    if (
                                        nomeCache !==
                                        CACHE_NAME
                                    ) {

                                        console.log(
                                            "[Service Worker V6] Removendo cache antigo:",
                                            nomeCache
                                        );


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
                         * Faz o V6 assumir imediatamente
                         * as páginas abertas.
                         */

                        return self.clients.claim();

                    }
                )

        );

    }
);


/* =========================================================
   REQUISIÇÕES
========================================================= */

self.addEventListener(
    "fetch",
    function (event) {

        /*
         * Não interferimos em POST,
         * PUT, DELETE etc.
         */

        if (
            event.request.method !==
            "GET"
        ) {

            return;

        }


        /* =================================================
           NAVEGAÇÃO / INDEX.HTML

           ESTRATÉGIA:

           INTERNET PRIMEIRO
                  ↓
           Atualiza o cache
                  ↓
           Sem internet?
                  ↓
           Abre versão offline
        ================================================= */

        if (
            event.request.mode ===
            "navigate"
        ) {

            event.respondWith(

                fetch(
                    event.request,
                    {

                        /*
                         * Evita receber uma cópia antiga
                         * do HTML pelo cache HTTP.
                         */

                        cache:
                            "no-store"

                    }
                )

                .then(
                    function (response) {

                        /*
                         * Só armazenamos respostas válidas.
                         */

                        if (
                            response &&
                            response.status === 200
                        ) {

                            const copia =
                                response.clone();


                            caches
                                .open(
                                    CACHE_NAME
                                )

                                .then(
                                    function (cache) {

                                        /*
                                         * Atualiza a versão offline
                                         * do index.html.
                                         */

                                        cache.put(
                                            "./index.html",
                                            copia
                                        );

                                    }
                                );

                        }


                        /*
                         * Mostra a versão recebida
                         * pela internet.
                         */

                        return response;

                    }
                )

                .catch(
                    function () {

                        console.log(
                            "[Service Worker V6] Sem internet. Abrindo versão offline."
                        );


                        /*
                         * Se estiver offline,
                         * abre o index.html salvo.
                         */

                        return caches.match(
                            "./index.html"
                        );

                    }
                )

            );


            return;

        }


        /* =================================================
           ARQUIVOS ESTÁTICOS

           manifest.json
           icon.png
           etc.

           ESTRATÉGIA:

           CACHE PRIMEIRO
                  ↓
           Se não existir
                  ↓
           INTERNET
                  ↓
           Salva no cache
        ================================================= */

        event.respondWith(

            caches
                .match(
                    event.request
                )

                .then(
                    function (arquivoCache) {

                        /*
                         * Arquivo encontrado localmente.
                         */

                        if (
                            arquivoCache
                        ) {

                            return arquivoCache;

                        }


                        /*
                         * Arquivo não encontrado.
                         *
                         * Tenta buscar na internet.
                         */

                        return fetch(
                            event.request
                        )

                        .then(
                            function (response) {

                                /*
                                 * Não armazenamos respostas
                                 * inválidas.
                                 */

                                if (
                                    !response ||
                                    response.status !== 200
                                ) {

                                    return response;

                                }


                                const copia =
                                    response.clone();


                                /*
                                 * Salva para uso futuro
                                 * sem internet.
                                 */

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


                                return response;

                            }
                        )

                        .catch(
                            function (erro) {

                                console.log(
                                    "[Service Worker V6] Recurso indisponível offline:",
                                    event.request.url
                                );


                                /*
                                 * Para recursos não essenciais,
                                 * deixamos a requisição falhar
                                 * normalmente.
                                 */

                                return new Response(
                                    "",
                                    {
                                        status: 503,
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


/* =========================================================
   MENSAGENS
========================================================= */

/*
 * Permite que futuramente o index.html
 * solicite uma atualização imediata
 * do Service Worker.
 */

self.addEventListener(
    "message",
    function (event) {

        if (
            event.data &&
            event.data.type ===
            "SKIP_WAITING"
        ) {

            self.skipWaiting();

        }

    }
);
