const selectMarca = document.getElementById("marca");
const botaoBuscar = document.getElementById("botao-buscar");
const areaResultado = document.getElementById("resultado");



async function carregarMarcas() {

    try {

        const resposta = await fetch(
            "https://brasilapi.com.br/api/fipe/marcas/v1/carros"
        );

        if (!resposta.ok) {
            throw new Error("Erro ao carregar as marcas.");
        }

        const marcas = await resposta.json();


        marcas.sort((a, b) =>
            a.nome.localeCompare(b.nome)
        );

        selectMarca.innerHTML =
            '<option value="">Selecione uma marca</option>';

        marcas.forEach((marca) => {

            const opcao = document.createElement("option");

            opcao.value = marca.valor;
            opcao.textContent = marca.nome;

            selectMarca.appendChild(opcao);

        });

        botaoBuscar.disabled = false;

    } catch (erro) {

        selectMarca.innerHTML =
            '<option value="">Erro ao carregar marcas</option>';

        areaResultado.innerHTML = `
            <div class="mensagem erro">
                <span>⚠️</span>
                <p>Não foi possível carregar as marcas.</p>
                <p>Tente novamente mais tarde.</p>
            </div>
        `;

        console.error("Erro:", erro);
    }
}



async function buscarModelos() {

    const codigoMarca = selectMarca.value;

    const nomeMarca =
        selectMarca.options[selectMarca.selectedIndex].text;



    if (codigoMarca === "") {

        areaResultado.innerHTML = `
            <div class="mensagem">
                <span>🚗</span>
                <p>Escolha uma marca antes de realizar a busca.</p>
            </div>
        `;

        return;
    }


    areaResultado.innerHTML = `
        <div class="mensagem">
            <span>🔎</span>
            <p>Buscando modelos da ${nomeMarca}...</p>
        </div>
    `;


    try {

        const resposta = await fetch(
            `https://brasilapi.com.br/api/fipe/veiculos/v1/carros/${codigoMarca}`
        );

        if (!resposta.ok) {
            throw new Error("Erro ao buscar os modelos.");
        }

        const modelos = await resposta.json();


        if (modelos.length === 0) {

            areaResultado.innerHTML = `
                <div class="mensagem">
                    <span>😕</span>
                    <p>Nenhum modelo encontrado para ${nomeMarca}.</p>
                </div>
            `;

            return;
        }


        exibirModelos(
            modelos,
            nomeMarca,
            codigoMarca
        );


    } catch (erro) {

        areaResultado.innerHTML = `
            <div class="mensagem erro">
                <span>⚠️</span>
                <p>Ops! Não foi possível realizar a busca.</p>
                <p>Tente novamente em alguns instantes.</p>
            </div>
        `;

        console.error("Erro:", erro);
    }
}



function exibirModelos(modelos, nomeMarca, codigoMarca) {

    let html = `

        <div class="cabecalho-resultados">

            <h2>${nomeMarca}</h2>

            <p>
                ${modelos.length} modelo(s) encontrado(s)
            </p>

        </div>

        <div class="lista-modelos">
    `;


    modelos.forEach((veiculo) => {

        html += `

            <article class="card-veiculo">

                <div class="icone-carro">
                    🚘
                </div>

                <h3>${veiculo.modelo}</h3>

                <div class="informacoes">

                    <p>
                        <strong>Marca:</strong>
                        ${nomeMarca}
                    </p>

                    <p>
                        <strong>Código da marca:</strong>
                        ${codigoMarca}
                    </p>

                    <p>
                        <strong>Código do modelo:</strong>
                        ${veiculo.valor}
                    </p>

                </div>

            </article>
        `;

    });


    html += "</div>";

    areaResultado.innerHTML = html;
}


// Evento do botão
botaoBuscar.addEventListener(
    "click",
    buscarModelos
);



carregarMarcas();