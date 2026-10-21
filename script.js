class Produto { 
    constructor(nome, preco, quantidade) {
        this.nome = nome;
        this.preco = parseFloat(preco);
        this.quantidade = parseInt(quantidade);
    }

    calcularsubtotal() {
        return this.preco * this.quantidade;
    }
}

// Carrega os dados salvos do computador do usuário ou inicia vazio se for o primeiro acesso
const dadosSalvos = JSON.parse(localStorage.getItem("estoque_produtos")) || [];
// Reconverte os dados brutos de texto em instâncias da classe Produto
const listaDeProdutos = dadosSalvos.map(p => new Produto(p.nome, p.preco, p.quantidade));

let indexEdicao = null; // Controla se estamos editando ou criando um produto

const formProduto = document.getElementById("produto-form");
const btnSalvar = formProduto.querySelector("button");
const btnLimpar = document.getElementById("btn-limpar");

// [C]REATE & [U]PDATE - Cadastro ou Alteração de Produto
formProduto.addEventListener("submit", function (event) {
    event.preventDefault();

    const nomeInput = document.getElementById("nome").value;
    const precoInput = document.getElementById("preco").value;
    const quantidadeInput = document.getElementById("quantidade").value;

    const precoVerificacao = parseFloat(precoInput);
    if (precoVerificacao <= 0) {
        alert("O preço tem que ser maior que 0");
        return; 
    }

    if (indexEdicao === null) {
        // [C]REATE: Adiciona um novo objeto à lista
        const novoProduto = new Produto(nomeInput, precoInput, quantidadeInput);
        listaDeProdutos.push(novoProduto);
    } else {
        // [U]PDATE: Substitui os dados no índice selecionado
        listaDeProdutos[indexEdicao] = new Produto(nomeInput, precoInput, quantidadeInput);
        indexEdicao = null; // Sai do modo edição
        btnSalvar.textContent = "Adicionar produto";
        btnSalvar.className = "btn-primary";
    }

    atualizarInterface();
    formProduto.reset();
});

// [R]EAD - Desenha as linhas da tabela na tela
function renderizarTabela() {
    const tabelaBody = document.querySelector("#tabela-produtos tbody");
    if (!tabelaBody) return; 

    tabelaBody.innerHTML = "";
    
    listaDeProdutos.forEach((produto, index) => {
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${produto.nome}</td>
            <td>R$ ${produto.preco.toFixed(2)}</td>
            <td>${produto.quantidade}</td>
            <td>R$ ${produto.calcularsubtotal().toFixed(2)}</td>
            <td>
                <button class="btn-editar" onclick="prepararEdicao(${index})">Editar</button>
                <button class="btn-remover" onclick="removerProduto(${index})">Remover</button>
            </td>
        `;

        tabelaBody.appendChild(linha);
    });
}

// Auxiliar do [U]PDATE - Puxa os dados da tabela de volta para os inputs do formulário
function prepararEdicao(index) {
    const produto = listaDeProdutos[index];
    
    document.getElementById("nome").value = produto.nome;
    document.getElementById("preco").value = produto.preco;
    document.getElementById("quantidade").value = produto.quantidade;

    indexEdicao = index; // Guarda a posição que estamos editando
    btnSalvar.textContent = "Salvar Alterações";
    btnSalvar.className = "btn-success"; // Deixa o botão verde
}

// [D]ELETE - Apaga um registro específico da lista
function removerProduto(index) {
    listaDeProdutos.splice(index, 1);
    
    // Se o item deletado for o que estava sendo editado, cancela a ação de edição
    if (indexEdicao === index) {
        indexEdicao = null;
        btnSalvar.textContent = "Adicionar produto";
        btnSalvar.className = "btn-primary";
        formProduto.reset();
    }
    
    atualizarInterface();
}

// [D]ELETE ALL - Limpa o estoque inteiro
btnLimpar.addEventListener("click", function() {
    if (listaDeProdutos.length === 0) return;
    
    if (confirm("Tem certeza que deseja limpar todo o estoque?")) {
        listaDeProdutos.length = 0;
        indexEdicao = null;
        btnSalvar.textContent = "Adicionar produto";
        btnSalvar.className = "btn-primary";
        formProduto.reset();
        atualizarInterface();
    }
});

// Salva as alterações no navegador, recarrega a tabela e calcula a soma total
function atualizarInterface() {
    // Grava de verdade as modificações no banco local do navegador
    localStorage.setItem("estoque_produtos", JSON.stringify(listaDeProdutos));

    renderizarTabela();
    
    const total = listaDeProdutos.reduce((acumulador, produto) => {
        return acumulador + produto.calcularsubtotal();
    }, 0);

    const elementoTotal = document.getElementById("total-estoque");
    elementoTotal.textContent = `Total em estoque: ${total.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    })}`;
}

// Executado automaticamente ao abrir a página para carregar os dados persistidos
atualizarInterface();
