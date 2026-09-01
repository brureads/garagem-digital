const campoBusca = document.getElementById("campo-busca");
const botaoBuscar = document.getElementById("botao-buscar");
const areaResultado = document.getElementById("resultado");

async function buscarModelos(marca) {
    areaResultado.innerHTML = "<p>Buscando veículos... 🚗</p>";

    try {
        const resposta = await fetch(
            `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${encodeURIComponent(marca)}?format=json`
        );

        if (!resposta.ok) {
            throw new Error("Erro ao consultar a API.");
        }

        const dados = await resposta.json();

        if (!dados.Results || dados.Results.length === 0) {
            areaResultado.innerHTML = `
                <p>😕 Nenhum modelo encontrado para a marca <strong>${marca}</strong>.</p>
                <p>Verifique o nome da marca e tente novamente.</p>
            `;
            return;
        }

        exibirModelos(dados.Results, marca);

    } catch (erro) {
        areaResultado.innerHTML = `
            <p>⚠️ Ops! Não foi possível realizar a busca.</p>
            <p>Tente novamente em alguns instantes.</p>
        `;

        console.error("Erro:", erro);
    }
}

function exibirModelos(modelos, marcaPesquisada) {
    let html = `
        <div class="cabecalho-resultados">
            <h2>Resultados para "${marcaPesquisada}"</h2>
            <p>${modelos.length} modelo(s) encontrado(s).</p>
        </div>

        <div class="lista-modelos">
    `;

    modelos.forEach((veiculo) => {
        html += `
            <div class="card-veiculo">
                <h3>🚘 ${veiculo.Model_Name}</h3>

                <p>
                    <strong>Marca:</strong>
                    ${veiculo.Make_Name}
                </p>

                <p>
                    <strong>ID da marca:</strong>
                    ${veiculo.Make_ID}
                </p>

                <p>
                    <strong>ID do modelo:</strong>
                    ${veiculo.Model_ID}
                </p>
            </div>
        `;
    });

    html += "</div>";

    areaResultado.innerHTML = html;
}

function realizarBusca() {
    const marca = campoBusca.value.trim();

    if (marca === "") {
        areaResultado.innerHTML = `
            <p>🚗 Digite uma marca de carro antes de buscar.</p>
        `;
        return;
    }

    buscarModelos(marca);
}

botaoBuscar.addEventListener("click", realizarBusca);

campoBusca.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") {
        realizarBusca();
    }
});