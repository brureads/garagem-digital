const selectMarca = document.getElementById("marca");
const botaoBuscar = document.getElementById("botao-buscar");
const areaResultado = document.getElementById("resultado");

const cacheImagens = new Map();


// ==================================================
// MARCAS E MODELOS QUE A GARAGEM DIGITAL VAI EXIBIR
// ==================================================

const catalogo = {

    "Audi": [
        "A3",
        "A4",
        "A5",
        "A6",
        "Q3",
        "Q5",
        "Q7",
        "Q8",
        "TT"
    ],

    "BMW": [
        "Serie 1",
        "Serie 3",
        "Serie 5",
        "X1",
        "X3",
        "X5",
        "X6",
        "X7",
        "Z4"
    ],

    "BYD": [
        "Dolphin Mini",
        "Dolphin",
        "Seal",
        "Song Plus",
        "Song Pro",
        "Yuan Plus",
        "King",
        "Tan"
    ],

    "CAOA Chery": [
        "Tiggo 5X",
        "Tiggo 7",
        "Tiggo 8",
        "Arrizo 5",
        "Arrizo 6"
    ],

    "Chevrolet": [
        "Onix",
        "Onix Plus",
        "Tracker",
        "Cruze",
        "S10",
        "Spin",
        "Trailblazer",
        "Equinox",
        "Montana",
        "Cobalt"
    ],

    "Citroën": [
        "C3",
        "C4",
        "C4 Cactus",
        "C3 Aircross",
        "Basalt"
    ],

    "Fiat": [
        "Uno",
        "Palio",
        "Argo",
        "Mobi",
        "Cronos",
        "Pulse",
        "Fastback",
        "Toro",
        "Strada"
    ],

    "Ford": [
        "EcoSport",
        "Ka",
        "Focus",
        "Fusion",
        "Mustang",
        "Ranger",
        "Territory",
        "Bronco",
        "Edge"
    ],

    "GWM": [
        "Haval H6",
        "Haval H9",
        "Ora 03",
        "Tank 300"
    ],

    "Honda": [
        "Civic",
        "City",
        "Fit",
        "HR-V",
        "WR-V",
        "CR-V",
        "Accord"
    ],

    "Hyundai": [
        "HB20",
        "HB20S",
        "Creta",
        "Tucson",
        "Santa Fe",
        "Azera",
        "i30"
    ],

    "Jeep": [
        "Renegade",
        "Compass",
        "Commander",
        "Cherokee",
        "Grand Cherokee",
        "Wrangler"
    ],

    "Kia": [
        "Picanto",
        "Cerato",
        "Sportage",
        "Sorento",
        "Soul",
        "Stonic"
    ],

    "Land Rover": [
        "Discovery",
        "Discovery Sport",
        "Defender",
        "Range Rover",
        "Range Rover Evoque",
        "Range Rover Velar"
    ],

    "Mercedes-Benz": [
        "Classe A",
        "Classe C",
        "Classe E",
        "Classe G",
        "GLA",
        "GLC",
        "GLE"
    ],

    "Mitsubishi": [
        "Lancer",
        "ASX",
        "Eclipse Cross",
        "Outlander",
        "Pajero",
        "L200"
    ],

    "Nissan": [
        "March",
        "Versa",
        "Sentra",
        "Kicks",
        "Frontier",
        "X-Trail"
    ],

    "Peugeot": [
        "206",
        "207",
        "208",
        "2008",
        "3008",
        "5008"
    ],

    "Porsche": [
        "911",
        "718",
        "Cayenne",
        "Macan",
        "Panamera",
        "Taycan"
    ],

    "RAM": [
        "1500",
        "2500",
        "3500",
        "Rampage"
    ],

    "Renault": [
        "Kwid",
        "Sandero",
        "Logan",
        "Duster",
        "Oroch",
        "Captur",
        "Kardian",
        "Megane"
    ],

    "Toyota": [
        "Corolla Cross",
        "Corolla",
        "Yaris",
        "Yaris Cross",
        "Etios",
        "Hilux",
        "SW4",
        "RAV4",
        "Camry"
    ],

    "Volkswagen": [
        "T-Cross",
        "Nivus",
        "Polo",
        "Virtus",
        "Golf",
        "Jetta",
        "Taos",
        "Saveiro",
        "Amarok",
        "Tiguan"
    ],

    "Volvo": [
        "EX30",
        "XC40",
        "XC60",
        "XC90",
        "S60",
        "S90"
    ]
};


// ==================================================
// NOMES QUE A BRASILAPI USA
// ==================================================

const nomesMarcasAPI = {

    "Audi": ["audi"],

    "BMW": ["bmw"],

    "BYD": ["byd"],

    "CAOA Chery": [
        "chery",
        "caoa chery"
    ],

    "Chevrolet": [
        "gm - chevrolet",
        "chevrolet"
    ],

    "Citroën": [
        "citroen",
        "citroën"
    ],

    "Fiat": ["fiat"],

    "Ford": ["ford"],

    "GWM": ["gwm"],

    "Honda": ["honda"],

    "Hyundai": ["hyundai"],

    "Jeep": ["jeep"],

    "Kia": [
        "kia",
        "kia motors"
    ],

    "Land Rover": ["land rover"],

    "Mercedes-Benz": [
        "mercedes-benz",
        "mercedes benz"
    ],

    "Mitsubishi": ["mitsubishi"],

    "Nissan": ["nissan"],

    "Peugeot": ["peugeot"],

    "Porsche": ["porsche"],

    "RAM": ["ram"],

    "Renault": ["renault"],

    "Toyota": ["toyota"],

    "Volkswagen": [
        "vw - volkswagen",
        "volkswagen"
    ],

    "Volvo": ["volvo"]
};


// ==================================================
// NORMALIZAR TEXTO
// ==================================================

function normalizar(texto) {

    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}


// ==================================================
// IDENTIFICAR NOME BONITO DA MARCA
// ==================================================

function encontrarMarca(nomeAPI) {

    const nomeNormalizado =
        normalizar(nomeAPI);


    for (const marca in nomesMarcasAPI) {

        const nomes =
            nomesMarcasAPI[marca];


        const encontrou =
            nomes.some(nome =>
                nomeNormalizado.includes(
                    normalizar(nome)
                )
            );


        if (encontrou) {
            return marca;
        }
    }


    return null;
}


// ==================================================
// CARREGAR SOMENTE MARCAS CONHECIDAS
// ==================================================

async function carregarMarcas() {

    try {

        const resposta = await fetch(
            "https://brasilapi.com.br/api/fipe/marcas/v1/carros"
        );


        if (!resposta.ok) {
            throw new Error(
                "Erro ao carregar as marcas."
            );
        }


        const marcasAPI =
            await resposta.json();


        const marcasEncontradas = [];


        marcasAPI.forEach(item => {

            const marca =
                encontrarMarca(item.nome);


            if (
                marca &&
                !marcasEncontradas.some(
                    existente =>
                        existente.nome === marca
                )
            ) {

                marcasEncontradas.push({

                    nome: marca,

                    codigo: item.valor
                });
            }
        });


        marcasEncontradas.sort(
            (a, b) =>
                a.nome.localeCompare(
                    b.nome,
                    "pt-BR"
                )
        );


        selectMarca.innerHTML =
            `<option value="">
                Selecione uma marca
            </option>`;


        marcasEncontradas.forEach(
            marca => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    marca.codigo;


                option.textContent =
                    marca.nome;


                selectMarca.appendChild(
                    option
                );
            }
        );


        botaoBuscar.disabled = false;


    } catch (erro) {

        selectMarca.innerHTML = `
            <option>
                Erro ao carregar marcas
            </option>
        `;


        areaResultado.innerHTML = `

            <div class="mensagem erro">

                <span>⚠️</span>

                <p>
                    Não foi possível carregar
                    as marcas.
                </p>

                <p>
                    Tente novamente mais tarde.
                </p>

            </div>
        `;


        console.error(erro);
    }
}


// ==================================================
// IDENTIFICAR MODELO CONHECIDO
// ==================================================

function identificarModelo(
    nomeCompleto,
    marca
) {

    const modelosPermitidos =
        catalogo[marca] || [];


    const nome =
        normalizar(nomeCompleto);


    /*
     * Ordenamos do maior para o menor
     * para evitar:
     *
     * Corolla Cross virar Corolla
     * Dolphin Mini virar Dolphin
     */
    const ordenados =
        [...modelosPermitidos]
            .sort(
                (a, b) =>
                    b.length - a.length
            );


    for (const modelo of ordenados) {

        const modeloNormalizado =
            normalizar(modelo);


        if (
            nome.startsWith(
                modeloNormalizado
            )
        ) {

            return modelo;
        }
    }


    return null;
}


// ==================================================
// FILTRAR E AGRUPAR MODELOS
// ==================================================

function prepararModelos(
    modelosAPI,
    marca
) {

    const grupos = new Map();


    modelosAPI.forEach(veiculo => {

        const modelo =
            identificarModelo(
                veiculo.modelo,
                marca
            );


        /*
         * Ignora carros que não fazem
         * parte do nosso catálogo.
         */
        if (!modelo) {
            return;
        }


        if (!grupos.has(modelo)) {

            grupos.set(modelo, {

                nome: modelo,

                codigoReferencia:
                    veiculo.valor,

                versoes: []
            });
        }


        grupos
            .get(modelo)
            .versoes
            .push(veiculo);
    });


    return Array.from(
        grupos.values()
    ).sort(
        (a, b) =>
            a.nome.localeCompare(
                b.nome,
                "pt-BR"
            )
    );
}


// ==================================================
// BUSCAR MODELOS NA BRASILAPI
// ==================================================

async function buscarModelos() {

    const codigoMarca =
        selectMarca.value;


    const marca =
        selectMarca.options[
            selectMarca.selectedIndex
        ].text;


    if (!codigoMarca) {

        areaResultado.innerHTML = `

            <div class="mensagem">

                <span>🚗</span>

                <p>
                    Escolha uma marca antes
                    de realizar a busca.
                </p>

            </div>
        `;

        return;
    }


    areaResultado.innerHTML = `

        <div class="mensagem">

            <span>🔎</span>

            <p>
                Buscando carros da
                ${marca}...
            </p>

        </div>
    `;


    try {

        const resposta = await fetch(

            `https://brasilapi.com.br/api/fipe/veiculos/v1/carros/${codigoMarca}`

        );


        if (!resposta.ok) {
            throw new Error(
                "Erro ao consultar modelos."
            );
        }


        const modelosAPI =
            await resposta.json();


        const modelos =
            prepararModelos(
                modelosAPI,
                marca
            );


        if (modelos.length === 0) {

            areaResultado.innerHTML = `

                <div class="mensagem">

                    <span>😕</span>

                    <p>
                        Não encontramos modelos
                        conhecidos dessa marca.
                    </p>

                </div>
            `;

            return;
        }


        exibirModelos(
            modelos,
            marca
        );


    } catch (erro) {

        areaResultado.innerHTML = `

            <div class="mensagem erro">

                <span>⚠️</span>

                <p>
                    Ops! Não foi possível
                    realizar a busca.
                </p>

                <p>
                    Tente novamente em
                    alguns instantes.
                </p>

            </div>
        `;


        console.error(erro);
    }
}


// ==================================================
// AJUSTAR NOME DA MARCA PARA IMAGEM
// ==================================================

function marcaParaImagem(marca) {

    const nomes = {

        "CAOA Chery": "Chery",

        "RAM": "Ram Trucks"
    };


    return nomes[marca] || marca;
}


// ==================================================
// BUSCAR IMAGEM NO WIKIMEDIA COMMONS
// ==================================================

async function buscarImagem(
    marca,
    modelo
) {

    const chave =
        normalizar(
            `${marca}-${modelo}`
        );


    if (cacheImagens.has(chave)) {

        return cacheImagens.get(
            chave
        );
    }


    const marcaPesquisa =
        marcaParaImagem(marca);


    const pesquisa =
        `${marcaPesquisa} ${modelo} automobile`;


    const url =
        "https://commons.wikimedia.org/w/api.php" +
        "?action=query" +
        "&generator=search" +
        `&gsrsearch=${encodeURIComponent(pesquisa)}` +
        "&gsrnamespace=6" +
        "&gsrlimit=10" +
        "&prop=imageinfo" +
        "&iiprop=url|mime" +
        "&iiurlwidth=700" +
        "&format=json" +
        "&origin=*";


    try {

        const resposta =
            await fetch(url);


        if (!resposta.ok) {

            cacheImagens.set(
                chave,
                null
            );

            return null;
        }


        const dados =
            await resposta.json();


        if (!dados.query?.pages) {

            cacheImagens.set(
                chave,
                null
            );

            return null;
        }


        const paginas =
            Object.values(
                dados.query.pages
            );


        const modeloPrincipal =
            normalizar(
                modelo.split(" ")[0]
            );


        const palavrasProibidas = [

            "logo",

            "badge",

            "emblem",

            "engine",

            "interior",

            "dashboard",

            "steering",

            "wheel",

            "diagram",

            "brochure",

            "driver",

            "portrait",

            "person"
        ];


        for (const pagina of paginas) {

            const info =
                pagina.imageinfo?.[0];


            if (!info) {
                continue;
            }


            const titulo =
                normalizar(
                    pagina.title || ""
                );


            const possuiPalavraRuim =
                palavrasProibidas.some(
                    palavra =>
                        titulo.includes(
                            normalizar(palavra)
                        )
                );


            if (possuiPalavraRuim) {
                continue;
            }


            if (
                !titulo.includes(
                    modeloPrincipal
                )
            ) {
                continue;
            }


            const imagem =
                info.thumburl ||
                info.url;


            cacheImagens.set(
                chave,
                imagem
            );


            return imagem;
        }


        cacheImagens.set(
            chave,
            null
        );


        return null;


    } catch (erro) {

        console.error(
            "Erro ao buscar imagem:",
            erro
        );


        cacheImagens.set(
            chave,
            null
        );


        return null;
    }
}


// ==================================================
// CARREGAR FOTO DO CARD
// ==================================================

async function carregarFoto(card) {

    if (
        card.dataset.carregado === "true"
    ) {
        return;
    }


    card.dataset.carregado = "true";


    const marca =
        card.dataset.marca;


    const modelo =
        card.dataset.modelo;


    const imagem =
        card.querySelector(
            ".foto-carro"
        );


    const placeholder =
        card.querySelector(
            ".foto-indisponivel"
        );


    placeholder.innerHTML = `

        🚘

        <span>
            Carregando foto...
        </span>
    `;


    const url =
        await buscarImagem(
            marca,
            modelo
        );


    if (!url) {

        placeholder.innerHTML = `

            🚘

            <span>
                ${marca} ${modelo}
            </span>
        `;

        return;
    }


    imagem.onload = () => {

        imagem.style.display =
            "block";


        placeholder.style.display =
            "none";
    };


    imagem.onerror = () => {

        imagem.style.display =
            "none";


        placeholder.style.display =
            "flex";


        placeholder.innerHTML = `

            🚘

            <span>
                ${marca} ${modelo}
            </span>
        `;
    };


    imagem.src = url;
}


// ==================================================
// OBSERVAR CARDS
// ==================================================

function observarCards() {

    const observer =
        new IntersectionObserver(

            entradas => {

                entradas.forEach(
                    entrada => {

                        if (
                            entrada.isIntersecting
                        ) {

                            carregarFoto(
                                entrada.target
                            );


                            observer.unobserve(
                                entrada.target
                            );
                        }
                    }
                );
            },

            {
                rootMargin: "250px"
            }
        );


    document
        .querySelectorAll(
            ".card-veiculo"
        )
        .forEach(
            card =>
                observer.observe(card)
        );
}


// ==================================================
// EXIBIR CARDS
// ==================================================

function exibirModelos(
    modelos,
    marca
) {

    let html = `

        <div class="cabecalho-resultados">

            <h2>
                ${marca}
            </h2>

            <p>
                ${modelos.length}
                modelo(s) selecionado(s)
            </p>

        </div>


        <div class="lista-modelos">
    `;


    modelos.forEach(modelo => {

        html += `

            <article
                class="card-veiculo"

                data-marca="${marca}"

                data-modelo="${modelo.nome}"

                data-carregado="false"
            >

                <div class="area-foto">

                    <img
                        class="foto-carro"

                        alt="${marca} ${modelo.nome}"

                        style="display: none;"
                    >


                    <div
                        class="foto-indisponivel"

                        style="display: flex;"
                    >

                        🚘

                        <span>
                            Aguardando foto...
                        </span>

                    </div>

                </div>


                <h3>
                    ${modelo.nome}
                </h3>


                <div class="informacoes">

                    <p>
                        <strong>
                            Marca:
                        </strong>

                        ${marca}
                    </p>


                    <p>
                        <strong>
                            Versões na FIPE:
                        </strong>

                        ${modelo.versoes.length}
                    </p>


                    <p>
                        <strong>
                            Código de referência:
                        </strong>

                        ${modelo.codigoReferencia}
                    </p>

                </div>

            </article>
        `;
    });


    html += "</div>";


    areaResultado.innerHTML =
        html;


    observarCards();
}


// ==================================================
// EVENTO DO BOTÃO
// ==================================================

botaoBuscar.addEventListener(
    "click",
    buscarModelos
);


// ==================================================
// INICIAR
// ==================================================

carregarMarcas();