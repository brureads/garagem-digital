
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signInAnonymously
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    doc,
    setDoc,
    deleteDoc,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";

// CONFIGURACAO FIREBASE

const firebaseConfig = {
    apiKey: "AIzaSyAba7VFBKMVvIIRz-Yn4kosjAPyWxUUGJQ",
    authDomain: "garagemdigital-ed84f.firebaseapp.com",
    projectId: "garagemdigital-ed84f",
    storageBucket: "garagemdigital-ed84f.firebasestorage.app",
    messagingSenderId: "90813167551",
    appId: "1:90813167551:web:5ddd65446e5d19fd55130a",
    measurementId: "G-BXH02ZBLZY"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ELEMENTOS DA PAGINA

const selectMarca = document.getElementById("marca");
const botaoBuscar = document.getElementById("botao-buscar");
const areaResultado = document.getElementById("resultado");
const listaFavoritos = document.getElementById("favoritos-lista");
const statusFavoritos = document.getElementById("status-favoritos");

let usuarioAtual = null;
let favoritos = new Map();
let cancelarObservacao = null;

let marcaAtual = "";
let codigoMarcaAtual = "";
let modelosAtuais = [];

const cacheImagens = new Map();

// CATALOGO DE CARROS

const catalogo = {
    "Audi": ["A3", "A4", "A5", "A6", "Q3", "Q5", "Q7", "Q8", "TT"],
    "BMW": ["Serie 1", "Serie 3", "Serie 5", "X1", "X3", "X5", "X6", "X7", "Z4"],
    "BYD": ["Dolphin Mini", "Dolphin", "Seal", "Song Plus", "Song Pro", "Yuan Plus", "King", "Tan"],
    "CAOA Chery": ["Tiggo 5X", "Tiggo 7", "Tiggo 8", "Arrizo 5", "Arrizo 6"],
    "Chevrolet": ["Onix", "Onix Plus", "Tracker", "Cruze", "S10", "Spin", "Trailblazer", "Equinox", "Montana", "Cobalt"],
    "Citroën": ["C3", "C4", "C4 Cactus", "C3 Aircross", "Basalt"],
    "Fiat": ["Uno", "Palio", "Argo", "Mobi", "Cronos", "Pulse", "Fastback", "Toro", "Strada"],
    "Ford": ["EcoSport", "Ka", "Focus", "Fusion", "Mustang", "Ranger", "Territory", "Bronco", "Edge"],
    "GWM": ["Haval H6", "Haval H9", "Ora 03", "Tank 300"],
    "Honda": ["Civic", "City", "Fit", "HR-V", "WR-V", "CR-V", "Accord"],
    "Hyundai": ["HB20", "HB20S", "Creta", "Tucson", "Santa Fe", "Azera", "i30"],
    "Jeep": ["Renegade", "Compass", "Commander", "Cherokee", "Grand Cherokee", "Wrangler"],
    "Kia": ["Picanto", "Cerato", "Sportage", "Sorento", "Soul", "Stonic"],
    "Land Rover": ["Discovery", "Discovery Sport", "Defender", "Range Rover", "Range Rover Evoque", "Range Rover Velar"],
    "Mercedes-Benz": ["Classe A", "Classe C", "Classe E", "Classe G", "GLA", "GLC", "GLE"],
    "Mitsubishi": ["Lancer", "ASX", "Eclipse Cross", "Outlander", "Pajero", "L200"],
    "Nissan": ["March", "Versa", "Sentra", "Kicks", "Frontier", "X-Trail"],
    "Peugeot": ["206", "207", "208", "2008", "3008", "5008"],
    "Porsche": ["911", "718", "Cayenne", "Macan", "Panamera", "Taycan"],
    "RAM": ["1500", "2500", "3500", "Rampage"],
    "Renault": ["Kwid", "Sandero", "Logan", "Duster", "Oroch", "Captur", "Kardian", "Megane"],
    "Toyota": ["Corolla Cross", "Corolla", "Yaris", "Yaris Cross", "Etios", "Hilux", "SW4", "RAV4", "Camry"],
    "Volkswagen": ["T-Cross", "Nivus", "Polo", "Virtus", "Golf", "Jetta", "Taos", "Saveiro", "Amarok", "Tiguan"],
    "Volvo": ["EX30", "XC40", "XC60", "XC90", "S60", "S90"]
};

const nomesMarcasAPI = {
    "Audi": ["audi"],
    "BMW": ["bmw"],
    "BYD": ["byd"],
    "CAOA Chery": ["chery", "caoa chery"],
    "Chevrolet": ["gm chevrolet", "chevrolet"],
    "Citroën": ["citroen"],
    "Fiat": ["fiat"],
    "Ford": ["ford"],
    "GWM": ["gwm"],
    "Honda": ["honda"],
    "Hyundai": ["hyundai"],
    "Jeep": ["jeep"],
    "Kia": ["kia"],
    "Land Rover": ["land rover"],
    "Mercedes-Benz": ["mercedes benz"],
    "Mitsubishi": ["mitsubishi"],
    "Nissan": ["nissan"],
    "Peugeot": ["peugeot"],
    "Porsche": ["porsche"],
    "RAM": ["ram"],
    "Renault": ["renault"],
    "Toyota": ["toyota"],
    "Volkswagen": ["vw volkswagen", "volkswagen"],
    "Volvo": ["volvo"]
};

// FUNCOES AUXILIARES

function normalizar(texto) {
    return String(texto ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

function escaparHTML(texto) {
    return String(texto ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

async function obterJSON(url) {
    const resposta = await fetch(url);

    if (!resposta.ok) {
        throw new Error(`Erro HTTP ${resposta.status}`);
    }

    return resposta.json();
}

function mostrarMensagem(texto, erro = false) {
    areaResultado.innerHTML = `
        <div class="mensagem ${erro ? "erro" : ""}">
            <span>${erro ? "⚠️" : "🚘"}</span>
            <p>${escaparHTML(texto)}</p>
        </div>
    `;
}

// CARREGAMENTO DAS MARCAS

function encontrarMarca(nomeAPI) {
    const nomeNormalizado = normalizar(nomeAPI);

    for (const [marca, alternativas] of Object.entries(nomesMarcasAPI)) {
        if (alternativas.some(nome => normalizar(nome) === nomeNormalizado)) {
            return marca;
        }
    }

    return null;
}

async function carregarMarcas() {
    try {
        const marcasAPI = await obterJSON(
            "https://brasilapi.com.br/api/fipe/marcas/v1/carros"
        );

        const marcasEncontradas = new Map();

        marcasAPI.forEach(item => {
            const marca = encontrarMarca(item.nome);

            if (marca && !marcasEncontradas.has(marca)) {
                marcasEncontradas.set(marca, item.valor);
            }
        });

        selectMarca.innerHTML =
            '<option value="">Selecione uma marca</option>';

        [...marcasEncontradas.entries()]
            .sort((a, b) => a[0].localeCompare(b[0], "pt-BR"))
            .forEach(([nome, codigo]) => {
                const option = document.createElement("option");
                option.value = codigo;
                option.textContent = nome;
                selectMarca.appendChild(option);
            });

        botaoBuscar.disabled = marcasEncontradas.size === 0;

    } catch (erro) {
        console.error("Erro ao carregar marcas:", erro);
        selectMarca.innerHTML =
            '<option value="">Erro ao carregar marcas</option>';

        mostrarMensagem(
            "Não foi possível carregar as marcas. Tente novamente.",
            true
        );
    }
}

// BUSCA DOS MODELOS

function identificarModelo(nomeCompleto, marca) {
    const nome = normalizar(nomeCompleto);

    const permitidos = [...(catalogo[marca] || [])]
        .sort((a, b) => b.length - a.length);

    return permitidos.find(modelo => {
        const texto = normalizar(modelo);

        return nome === texto || nome.startsWith(texto + " ");
    }) || null;
}

function prepararModelos(modelosAPI, marca) {
    const grupos = new Map();

    modelosAPI.forEach(veiculo => {
        const nome = identificarModelo(veiculo.modelo, marca);

        if (!nome) return;

        if (!grupos.has(nome)) {
            grupos.set(nome, {
                nome: nome,
                codigoReferencia: veiculo.valor,
                versoes: []
            });
        }

        grupos.get(nome).versoes.push(veiculo);
    });

    return [...grupos.values()].sort(
        (a, b) => a.nome.localeCompare(b.nome, "pt-BR")
    );
}

async function buscarModelos() {
    const codigo = selectMarca.value;

    if (!codigo) {
        mostrarMensagem("Escolha uma marca antes de buscar.");
        return;
    }

    const marca = selectMarca.selectedOptions[0].textContent;

    mostrarMensagem(`Buscando carros da ${marca}...`);
    botaoBuscar.disabled = true;

    try {
        const dados = await obterJSON(
            `https://brasilapi.com.br/api/fipe/veiculos/v1/carros/${codigo}`
        );

        modelosAtuais = prepararModelos(dados, marca);
        marcaAtual = marca;
        codigoMarcaAtual = codigo;

        if (modelosAtuais.length === 0) {
            mostrarMensagem(
                "Não encontramos modelos conhecidos dessa marca."
            );
            return;
        }

        exibirModelos();

    } catch (erro) {
        console.error("Erro na busca:", erro);

        mostrarMensagem(
            "Não foi possível realizar a busca agora.",
            true
        );

    } finally {
        botaoBuscar.disabled = false;
    }
}

// FAVORITOS FIREBASE

function idFavorito(marca, modelo) {
    return encodeURIComponent(
        `${normalizar(marca)}_${normalizar(modelo)}`
    );
}

function referenciaFavorito(marca, modelo) {
    return doc(
        db,
        "usuarios",
        usuarioAtual.uid,
        "favoritos",
        idFavorito(marca, modelo)
    );
}

function atualizarBotoesFavoritos() {
    document.querySelectorAll(".card-veiculo").forEach(card => {
        const botao = card.querySelector(".botao-favorito");

        if (!botao) return;

        const salvo = favoritos.has(
            idFavorito(card.dataset.marca, card.dataset.modelo)
        );

        botao.textContent = salvo
            ? "♥ Remover dos favoritos"
            : "♡ Adicionar aos favoritos";

        botao.setAttribute("aria-pressed", String(salvo));
        botao.disabled = !usuarioAtual;
    });
}

function mostrarFavoritos() {
    atualizarBotoesFavoritos();

    if (favoritos.size === 0) {
        listaFavoritos.innerHTML = `
            <p class="vazio-favoritos">
                Nenhum carro favorito ainda.
                Escolha um modelo e adicione à sua garagem!
            </p>
        `;
        return;
    }

    const itens = [...favoritos.values()].sort((a, b) =>
        `${a.marca} ${a.modelo}`.localeCompare(
            `${b.marca} ${b.modelo}`,
            "pt-BR"
        )
    );

    listaFavoritos.innerHTML = itens.map(item => `
        <div class="item-favorito">
            <div>
                <strong>${escaparHTML(item.marca)}</strong>
                <span>${escaparHTML(item.modelo)}</span>
            </div>

            <button
                type="button"
                class="remover-favorito"
                data-id="${escaparHTML(idFavorito(item.marca, item.modelo))}">
                Remover
            </button>
        </div>
    `).join("");
}

async function alternarFavorito(indice, botao) {
    if (!usuarioAtual) return;

    const modelo = modelosAtuais[indice];
    if (!modelo) return;

    const referencia = referenciaFavorito(
        marcaAtual,
        modelo.nome
    );

    const chave = idFavorito(marcaAtual, modelo.nome);

    botao.disabled = true;

    try {
        if (favoritos.has(chave)) {
            await deleteDoc(referencia);
        } else {
            await setDoc(referencia, {
                marca: marcaAtual,
                modelo: modelo.nome,
                criadoEm: serverTimestamp()
            });
        }

    } catch (erro) {
        console.error("Erro ao salvar favorito:", erro);

        statusFavoritos.textContent =
            "Erro ao salvar. Verifique o Firestore.";

    } finally {
        botao.disabled = false;
    }
}

// EXIBICAO DOS CARROS

function exibirModelos() {
    let html = `
        <div class="cabecalho-resultados">
            <h2>${escaparHTML(marcaAtual)}</h2>
            <p>${modelosAtuais.length} modelos encontrados</p>
        </div>

        <div class="lista-modelos">
    `;

    modelosAtuais.forEach((modelo, indice) => {
        const salvo = favoritos.has(
            idFavorito(marcaAtual, modelo.nome)
        );

        html += `
            <article
                class="card-veiculo"
                data-indice="${indice}"
                data-marca="${escaparHTML(marcaAtual)}"
                data-modelo="${escaparHTML(modelo.nome)}"
                data-carregado="false">

                <div class="area-foto">
                    <img
                        class="foto-carro"
                        alt="${escaparHTML(marcaAtual)} ${escaparHTML(modelo.nome)}"
                        style="display:none">

                    <div class="foto-indisponivel" style="display:flex">
                        🚘
                        <span>Aguardando foto...</span>
                    </div>
                </div>

                <h3>${escaparHTML(modelo.nome)}</h3>

                <div class="informacoes">
                    <p>
                        <strong>Marca:</strong>
                        ${escaparHTML(marcaAtual)}
                    </p>

                    <p>
                        <strong>Versões na FIPE:</strong>
                        ${modelo.versoes.length}
                    </p>

                    <p>
                        <strong>Código de referência:</strong>
                        ${escaparHTML(modelo.codigoReferencia)}
                    </p>
                </div>

                <button
                    type="button"
                    class="botao-favorito"
                    data-indice="${indice}"
                    aria-pressed="${salvo}"
                    ${usuarioAtual ? "" : "disabled"}>
                    ${salvo
                ? "♥ Remover dos favoritos"
                : "♡ Adicionar aos favoritos"}
                </button>

                <div class="area-consulta-fipe">
                    <button
                        type="button"
                        class="botao-fipe"
                        data-indice="${indice}">
                        Consultar valor FIPE
                    </button>

                    <div
                        class="painel-consulta-fipe"
                        id="fipe-${indice}">
                    </div>
                </div>
            </article>
        `;
    });

    html += "</div>";

    areaResultado.innerHTML = html;
    observarCards();
}

// CONSULTA FIPE

function abrirConsultaFipe(indice) {
    const painel = document.getElementById(`fipe-${indice}`);
    const modelo = modelosAtuais[indice];

    if (!painel || !modelo) return;

    if (painel.dataset.aberto === "true") {
        painel.innerHTML = "";
        painel.dataset.aberto = "false";
        return;
    }

    document.querySelectorAll(".painel-consulta-fipe")
        .forEach(item => {
            item.innerHTML = "";
            item.dataset.aberto = "false";
        });

    const versoes = modelo.versoes
        .map((versao, indiceOriginal) => ({
            versao,
            indiceOriginal
        }))
        .sort((a, b) =>
            a.versao.modelo.localeCompare(
                b.versao.modelo,
                "pt-BR"
            )
        );

    painel.innerHTML = `
        <div class="painel-fipe">
            <label for="versao-${indice}">Versão:</label>

            <select
                class="select-versao"
                id="versao-${indice}"
                data-indice="${indice}">

                <option value="">Escolha a versão</option>

                ${versoes.map(item => `
                    <option value="${item.indiceOriginal}">
                        ${escaparHTML(item.versao.modelo)}
                    </option>
                `).join("")}
            </select>

            <div class="etapa-fipe"></div>
        </div>
    `;

    painel.dataset.aberto = "true";
}

async function carregarAnos(indiceModelo, indiceVersao) {
    const modelo = modelosAtuais[indiceModelo];
    const versao = modelo?.versoes[indiceVersao];

    const painel = document.getElementById(
        `fipe-${indiceModelo}`
    );

    if (!versao || !painel) return;

    const etapa = painel.querySelector(".etapa-fipe");

    etapa.innerHTML = `
        <div class="carregando-fipe">
            Consultando anos disponíveis...
        </div>
    `;

    try {
        const anos = await obterJSON(
            `https://fipe.parallelum.com.br/api/v2/cars/brands/${codigoMarcaAtual}/models/${versao.valor}/years`
        );

        if (!etapa.isConnected) return;

        anos.sort((a, b) =>
            parseInt(b.name, 10) - parseInt(a.name, 10)
        );

        etapa.innerHTML = `
            <label for="ano-${indiceModelo}">Ano:</label>

            <select
                class="select-ano"
                id="ano-${indiceModelo}"
                data-indice="${indiceModelo}"
                data-versao="${indiceVersao}">

                <option value="">Escolha o ano</option>

                ${anos.map(ano => `
                    <option value="${escaparHTML(ano.code)}">
                        ${escaparHTML(ano.name)}
                    </option>
                `).join("")}
            </select>

            <div class="resultado-fipe"></div>
        `;

    } catch (erro) {
        console.error("Erro ao consultar anos:", erro);

        if (etapa.isConnected) {
            etapa.innerHTML = `
                <div class="erro-fipe">
                    Não foi possível carregar os anos.
                </div>
            `;
        }
    }
}

async function consultarValorFipe(
    indiceModelo,
    indiceVersao,
    codigoAno
) {
    const modelo = modelosAtuais[indiceModelo];
    const versao = modelo?.versoes[indiceVersao];

    const painel = document.getElementById(
        `fipe-${indiceModelo}`
    );

    if (!versao || !painel) return;

    const resultado = painel.querySelector(".resultado-fipe");

    resultado.innerHTML = `
        <div class="carregando-fipe">
            Consultando valor FIPE...
        </div>
    `;

    try {
        const dados = await obterJSON(
            `https://fipe.parallelum.com.br/api/v2/cars/brands/${codigoMarcaAtual}/models/${versao.valor}/years/${encodeURIComponent(codigoAno)}`
        );

        if (!resultado.isConnected) return;

        resultado.innerHTML = `
            <div class="resultado-preco-fipe">
                <span class="titulo-fipe">
                    Valor FIPE
                </span>

                <strong class="valor-fipe">
                    ${escaparHTML(dados.price)}
                </strong>

                <p>
                    <strong>Modelo:</strong>
                    ${escaparHTML(dados.model)}
                </p>

                <p>
                    <strong>Ano:</strong>
                    ${escaparHTML(dados.modelYear)}
                </p>

                <p>
                    <strong>Combustível:</strong>
                    ${escaparHTML(dados.fuel)}
                </p>

                <p>
                    <strong>Código FIPE:</strong>
                    ${escaparHTML(dados.codeFipe)}
                </p>

                <p>
                    <strong>Referência:</strong>
                    ${escaparHTML(dados.referenceMonth)}
                </p>
            </div>
        `;

    } catch (erro) {
        console.error("Erro ao consultar FIPE:", erro);

        if (resultado.isConnected) {
            resultado.innerHTML = `
                <div class="erro-fipe">
                    Não foi possível consultar o valor FIPE agora.
                </div>
            `;
        }
    }
}

// IMAGENS DOS CARROS

async function buscarImagem(marca, modelo) {
    const chave = normalizar(`${marca}-${modelo}`);

    if (cacheImagens.has(chave)) {
        return cacheImagens.get(chave);
    }

    const pesquisa = `${marca} ${modelo} automobile`;

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
        const dados = await obterJSON(url);

        const paginas = Object.values(
            dados.query?.pages || {}
        );

        const proibidas = [
            "logo",
            "badge",
            "emblem",
            "engine",
            "interior",
            "dashboard",
            "diagram",
            "brochure",
            "portrait"
        ];

        const palavraModelo = normalizar(
            modelo.split(" ")[0]
        );

        for (const pagina of paginas) {
            const titulo = normalizar(pagina.title);
            const info = pagina.imageinfo?.[0];

            if (!info) continue;
            if (!titulo.includes(palavraModelo)) continue;

            if (proibidas.some(palavra =>
                titulo.includes(palavra))) {
                continue;
            }

            if (info.mime &&
                !info.mime.startsWith("image/")) {
                continue;
            }

            const imagem = info.thumburl || info.url;

            cacheImagens.set(chave, imagem);
            return imagem;
        }

    } catch (erro) {
        console.error("Erro ao buscar imagem:", erro);
    }

    cacheImagens.set(chave, null);
    return null;
}

async function carregarFoto(card) {
    if (card.dataset.carregado === "true") return;

    card.dataset.carregado = "true";

    const marca = card.dataset.marca;
    const modelo = card.dataset.modelo;

    const imagem = card.querySelector(".foto-carro");
    const placeholder = card.querySelector(
        ".foto-indisponivel"
    );

    placeholder.innerHTML = `
        🚘
        <span>Carregando foto...</span>
    `;

    const url = await buscarImagem(marca, modelo);

    if (!card.isConnected) return;

    if (!url) {
        placeholder.innerHTML = `
            🚘
            <span>
                ${escaparHTML(marca)}
                ${escaparHTML(modelo)}
            </span>
        `;
        return;
    }

    imagem.onload = () => {
        imagem.style.display = "block";
        placeholder.style.display = "none";
    };

    imagem.onerror = () => {
        imagem.style.display = "none";
        placeholder.style.display = "flex";

        placeholder.innerHTML = `
            🚘
            <span>
                ${escaparHTML(marca)}
                ${escaparHTML(modelo)}
            </span>
        `;
    };

    imagem.src = url;
}

function observarCards() {
    const cards = document.querySelectorAll(".card-veiculo");

    if (!("IntersectionObserver" in window)) {
        cards.forEach(carregarFoto);
        return;
    }

    const observer = new IntersectionObserver(
        entradas => {
            entradas.forEach(entrada => {
                if (entrada.isIntersecting) {
                    carregarFoto(entrada.target);
                    observer.unobserve(entrada.target);
                }
            });
        },
        {
            rootMargin: "250px"
        }
    );

    cards.forEach(card => observer.observe(card));
}

// EVENTOS DOS BOTOES

areaResultado.addEventListener("click", async evento => {
    const botaoFavorito = evento.target.closest(
        ".botao-favorito"
    );

    if (botaoFavorito) {
        await alternarFavorito(
            Number(botaoFavorito.dataset.indice),
            botaoFavorito
        );
        return;
    }

    const botaoFipe = evento.target.closest(".botao-fipe");

    if (botaoFipe) {
        abrirConsultaFipe(
            Number(botaoFipe.dataset.indice)
        );
    }
});

areaResultado.addEventListener("change", evento => {
    const campo = evento.target;

    if (campo.matches(".select-versao")) {
        const indice = Number(campo.dataset.indice);

        const painel = document.getElementById(
            `fipe-${indice}`
        );

        const etapa = painel.querySelector(".etapa-fipe");

        if (!campo.value) {
            etapa.innerHTML = "";
            return;
        }

        carregarAnos(
            indice,
            Number(campo.value)
        );
    }

    if (campo.matches(".select-ano") && campo.value) {
        consultarValorFipe(
            Number(campo.dataset.indice),
            Number(campo.dataset.versao),
            campo.value
        );
    }
});

listaFavoritos.addEventListener("click", async evento => {
    const botao = evento.target.closest(
        ".remover-favorito"
    );

    if (!botao || !usuarioAtual) return;

    botao.disabled = true;

    try {
        await deleteDoc(
            doc(
                db,
                "usuarios",
                usuarioAtual.uid,
                "favoritos",
                botao.dataset.id
            )
        );

    } catch (erro) {
        console.error("Erro ao remover favorito:", erro);

        statusFavoritos.textContent =
            "Erro ao remover favorito.";

        botao.disabled = false;
    }
});

// AUTENTICACAO E SINCRONIZACAO FIREBASE

onAuthStateChanged(auth, async usuario => {
    if (cancelarObservacao) {
        cancelarObservacao();
        cancelarObservacao = null;
    }

    usuarioAtual = usuario;

    if (!usuarioAtual) {
        favoritos.clear();
        mostrarFavoritos();

        statusFavoritos.textContent =
            "Conectando ao Firebase...";

        try {
            await signInAnonymously(auth);

        } catch (erro) {
            console.error("Erro de autenticação:", erro);

            statusFavoritos.textContent =
                "Ative o login Anônimo no Firebase Authentication.";
        }

        return;
    }

    statusFavoritos.textContent =
        "Carregando favoritos...";

    cancelarObservacao = onSnapshot(
        collection(
            db,
            "usuarios",
            usuarioAtual.uid,
            "favoritos"
        ),

        snapshot => {
            favoritos = new Map(
                snapshot.docs.map(documento => [
                    documento.id,
                    documento.data()
                ])
            );

            mostrarFavoritos();

            statusFavoritos.textContent =
                "Favoritos sincronizados com o Firebase.";
        },

        erro => {
            console.error("Erro no Firestore:", erro);

            statusFavoritos.textContent =
                "Erro de acesso. Confira as regras do Firestore.";
        }
    );
});

// INICIALIZACAO

botaoBuscar.addEventListener(
    "click",
    buscarModelos
);

carregarMarcas();
