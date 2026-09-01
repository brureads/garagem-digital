# 🚗 Garagem Digital

## Autor
Bruna Martins Moura — Matrícula 22650015

## Descrição
A Garagem Digital é uma aplicação web que permite explorar marcas e modelos de carros de forma simples e organizada.

A aplicação utiliza dados da Tabela FIPE por meio da BrasilAPI, permitindo que o usuário escolha uma marca e visualize modelos conhecidos, suas versões disponíveis e seus códigos de referência.

## API utilizada

- BrasilAPI — Tabela FIPE
- Documentação: https://brasilapi.com.br/docs

### Endpoints consumidos

Lista de marcas de carros:

https://brasilapi.com.br/api/fipe/marcas/v1/carros

Lista de veículos de uma determinada marca:

https://brasilapi.com.br/api/fipe/veiculos/v1/carros/{codigoMarca}

A aplicação também utiliza a API do Wikimedia Commons para buscar imagens ilustrativas dos modelos exibidos.

## Funcionalidades

- Seleção de marcas de carros conhecidas.
- Consulta de modelos utilizando a BrasilAPI.
- Exibição dos modelos disponíveis para cada marca.
- Exibição da quantidade de versões encontradas na Tabela FIPE.
- Exibição do código de referência dos modelos.
- Busca de imagens ilustrativas dos veículos.
- Tratamento de erros em caso de falha na API.
- Interface responsiva para diferentes tamanhos de tela.

## Tecnologias utilizadas

- HTML
- CSS
- JavaScript
- Fetch API
- BrasilAPI
- Wikimedia Commons API
- Git e GitHub
- GitHub Pages

## Como executar localmente

1. Clone o repositório:

`git clone https://github.com/brureads/garagem-digital.git`

2. Entre na pasta do projeto.

3. Abra o arquivo `index.html` no navegador.

Também é possível utilizar a extensão Live Server no Visual Studio Code.

## Links

- **Aplicação no ar (GitHub Pages):** https://brureads.github.io/garagem-digital/
- **Repositório:** https://github.com/brureads/garagem-digital