const fs = require('fs'); // Importa o módulo de sistema de arquivos do Node.js

// Definição da classe NoB para representar um nó na Árvore B
class NoB {
    constructor(ordem, ehFolha = true) {
        this.ordem = ordem; // Define a ordem da árvore B. A ordem determina o número máximo de filhos que um nó pode ter.
        this.ehFolha = ehFolha; // Define se o nó é uma folha (sem filhos) ou não.
        this.chaves = []; // Array que armazena as chaves do nó.
        this.filhos = []; // Array que armazena os filhos do nó (apenas se o nó não for uma folha).
    }

    // Método para converter o nó em um formato JSON
    toJSON() {
        return {
            ordem: this.ordem,
            ehFolha: this.ehFolha,
            chaves: this.chaves,
            filhos: this.filhos.map(filho => filho.toJSON()) // Converte recursivamente os filhos para JSON
        };
    }

    // Método estático para criar um nó a partir de um objeto JSON
    static fromJSON(json) {
        const no = new NoB(json.ordem, json.ehFolha);
        no.chaves = json.chaves;
        no.filhos = json.filhos.map(filho => NoB.fromJSON(filho)); // Converte recursivamente os filhos de JSON para NoB
        return no;
    }
}

// Definição da classe ArvoreB para manipular operações na árvore B
class ArvoreB {
    constructor(ordem) {
        this.ordem = ordem; // Armazena a ordem da árvore B.
        this.raiz = this.carregarEstado() || new NoB(ordem); // Inicializa a árvore a partir do arquivo ou cria uma nova raiz
    }

    inserir(chave) {
        let raiz = this.raiz; // Obtém a raiz atual da árvore.

        // Verifica se a raiz está cheia, ou seja, tem o número máximo de chaves.
        if (raiz.chaves.length === this.ordem - 1) {
            let novaRaiz = new NoB(this.ordem, false); // Cria uma nova raiz.
            novaRaiz.filhos.push(raiz); // Define a raiz antiga como o primeiro filho da nova raiz.
            this.dividirNo(novaRaiz, 0, raiz); // Divide o nó raiz antigo para reorganizar a árvore.
            this.raiz = novaRaiz; // Define a nova raiz como a raiz atual da árvore.
            this.inserirNaoCheio(novaRaiz, chave); // Insere a nova chave na árvore que agora não está cheia.
        } else {
            this.inserirNaoCheio(raiz, chave); // Insere a chave na raiz diretamente, se não estiver cheia.
        }

        this.salvarEstado(); // Salva o estado da árvore após a inserção
    }

    inserirNaoCheio(no, chave) {
        let i = no.chaves.length - 1; // Começa pelo índice da última chave no nó.

        if (no.ehFolha) { // Se o nó é uma folha,
            no.chaves.push(0); // Adiciona um espaço vazio para a nova chave.
            // Move todas as chaves maiores que a nova chave uma posição à direita.
            while (i >= 0 && chave < no.chaves[i]) {
                no.chaves[i + 1] = no.chaves[i];
                i--;
            }
            no.chaves[i + 1] = chave; // Insere a nova chave na posição correta.
        } else { // Se o nó não é uma folha,
            while (i >= 0 && chave < no.chaves[i]) { // Encontra o filho apropriado para a nova chave.
                i--;
            }
            i++; // Incrementa para o filho correto.
            if (no.filhos[i].chaves.length === this.ordem - 1) { // Se o filho está cheio,
                this.dividirNo(no, i, no.filhos[i]); // Divide o filho.
                if (chave > no.chaves[i]) { // Verifica se a chave deve ser inserida no novo nó criado após a divisão.
                    i++;
                }
            }
            this.inserirNaoCheio(no.filhos[i], chave); // Recursivamente insere a chave no filho apropriado.
        }
    }

    dividirNo(noPai, i, noCheio) {
        let novoNo = new NoB(this.ordem, noCheio.ehFolha); // Cria um novo nó para ser o "irmão" do nó cheio.
        // Divide as chaves do nó cheio, movendo metade para o novo nó.
        novoNo.chaves = noCheio.chaves.splice(Math.floor(this.ordem / 2), this.ordem - 1);
        if (!noCheio.ehFolha) { // Se o nó cheio não é uma folha,
            novoNo.filhos = noCheio.filhos.splice(Math.floor(this.ordem / 2), this.ordem); // Move metade dos filhos para o novo nó.
        }

        noPai.filhos.splice(i + 1, 0, novoNo); // Insere o novo nó na lista de filhos do pai.
        noPai.chaves.splice(i, 0, noCheio.chaves.pop()); // Move a chave do meio do nó cheio para o pai.
    }

    remover(chave) {
        if (!this.raiz) { // Se a árvore está vazia,
            console.log("A árvore está vazia."); // Imprime mensagem indicando que a árvore está vazia.
            return;
        }

        this.removerChave(this.raiz, chave); // Remove a chave da árvore.

        if (this.raiz.chaves.length === 0) { // Se a raiz ficou sem chaves após a remoção,
            this.raiz = this.raiz.ehFolha ? null : this.raiz.filhos[0]; // A nova raiz será o primeiro filho, ou null se não houver filhos.
        }

        this.salvarEstado(); // Salva o estado da árvore após a remoção
    }

    removerChave(no, chave) {
        let idx = 0;
        while (idx < no.chaves.length && no.chaves[idx] < chave) {
            idx++;
        }

        if (idx < no.chaves.length && no.chaves[idx] === chave) {
            // Caso 1: A chave está no nó atual
            if (no.ehFolha) {
                // Se o nó é uma folha, simplesmente remova a chave.
                no.chaves.splice(idx, 1);
            } else {
                // Se o nó não é uma folha, temos dois subcasos
                this.removerDeNaoFolha(no, idx);
            }
        } else {
            // Caso 2: A chave não está no nó atual
            if (no.ehFolha) {
                // Se o nó é uma folha, então a chave não está presente na árvore
                console.log("A chave " + chave + " não está presente na árvore.");
                return;
            }

            // O nó filho que contém a chave, ou onde a chave deve estar presente
            let ehUltimoFilho = (idx === no.chaves.length);
            if (no.filhos[idx].chaves.length < Math.ceil(this.ordem / 2) - 1) {
                this.preencher(no, idx);
            }

            // Se o último filho foi fundido, ele deve ter sido fundido com o filho anterior, e então precisamos revisitar o último filho atualizado
            if (ehUltimoFilho && idx > no.chaves.length) {
                this.removerChave(no.filhos[idx - 1], chave);
            } else {
                this.removerChave(no.filhos[idx], chave);
            }
        }
    }

    // Método para buscar uma chave na árvore B
    buscar(no, chave) {
        let i = 0;
        // Percorre as chaves do nó até encontrar uma chave maior ou igual à chave que está sendo buscada.
        while (i < no.chaves.length && chave > no.chaves[i]) {
            i++;
        }

        if (i < no.chaves.length && chave === no.chaves[i]) { // Se a chave é encontrada,
            return no; // Retorna o nó que contém a chave.
        }

        if (no.ehFolha) { // Se o nó é uma folha e a chave não foi encontrada,
            return null; // Retorna null, indicando que a chave não está na árvore.
        } else { // Se o nó não é uma folha,
            return this.buscar(no.filhos[i], chave); // Recursivamente busca no filho apropriado.
        }
    }

    // Função para salvar o estado da árvore em um arquivo JSON
    salvarEstado() {
        const json = JSON.stringify(this.raiz.toJSON(), null, 2);
        fs.writeFileSync('arvoreB.json', json, 'utf8');
    }

    // Função para carregar o estado da árvore de um arquivo JSON
    carregarEstado() {
        if (fs.existsSync('arvoreB.json')) {
            const jsonData = fs.readFileSync('arvoreB.json', 'utf8');
            const data = JSON.parse(jsonData);
            return NoB.fromJSON(data);
        }
        return null; // Retorna null se o arquivo não existir
    }

    removerDeNaoFolha(no, idx) {
        let chave = no.chaves[idx];

        if (no.filhos[idx].chaves.length >= Math.ceil(this.ordem / 2)) {
            let predecessor = this.getPredecessor(no, idx);
            no.chaves[idx] = predecessor;
            this.removerChave(no.filhos[idx], predecessor);
        } else if (no.filhos[idx + 1].chaves.length >= Math.ceil(this.ordem / 2)) {
            let sucessor = this.getSucessor(no, idx);
            no.chaves[idx] = sucessor;
            this.removerChave(no.filhos[idx + 1], sucessor);
        } else {
            this.fundir(no, idx);
            this.removerChave(no.filhos[idx], chave);
        }
    }

    getPredecessor(no, idx) {
        let atual = no.filhos[idx];
        while (!atual.ehFolha) {
            atual = atual.filhos[atual.chaves.length];
        }
        return atual.chaves[atual.chaves.length - 1];
    }

    getSucessor(no, idx) {
        let atual = no.filhos[idx + 1];
        while (!atual.ehFolha) {
            atual = atual.filhos[0];
        }
        return atual.chaves[0];
    }

    preencher(no, idx) {
        if (idx !== 0 && no.filhos[idx - 1].chaves.length >= Math.ceil(this.ordem / 2)) {
            this.pegarDoAnterior(no, idx);
        } else if (idx !== no.chaves.length && no.filhos[idx + 1].chaves.length >= Math.ceil(this.ordem / 2)) {
            this.pegarDoProximo(no, idx);
        } else {
            if (idx !== no.chaves.length) {
                this.fundir(no, idx);
            } else {
                this.fundir(no, idx - 1);
            }
        }
    }

    pegarDoAnterior(no, idx) {
        let filho = no.filhos[idx];
        let irmao = no.filhos[idx - 1];

        filho.chaves.unshift(no.chaves[idx - 1]);

        if (!filho.ehFolha) {
            filho.filhos.unshift(irmao.filhos.pop());
        }

        no.chaves[idx - 1] = irmao.chaves.pop();
    }

    pegarDoProximo(no, idx) {
        let filho = no.filhos[idx];
        let irmao = no.filhos[idx + 1];

        filho.chaves.push(no.chaves[idx]);

        if (!filho.ehFolha) {
            filho.filhos.push(irmao.filhos.shift());
        }

        no.chaves[idx] = irmao.chaves.shift();
    }

    fundir(no, idx) {
        let filho = no.filhos[idx];
        let irmao = no.filhos[idx + 1];

        filho.chaves.push(no.chaves[idx]);

        for (let i = 0; i < irmao.chaves.length; i++) {
            filho.chaves.push(irmao.chaves[i]);
        }

        if (!filho.ehFolha) {
            for (let i = 0; i <= irmao.chaves.length; i++) {
                filho.filhos.push(irmao.filhos[i]);
            }
        }

        no.chaves.splice(idx, 1);
        no.filhos.splice(idx + 1, 1);
    }

    // Nova função para imprimir a árvore de forma aninhada
    imprimirArvoreAninhada(no = this.raiz, nivel = 0, prefixo = "") {
        console.log(prefixo + (nivel > 0 ? "├── " : "") + `Nível ${nivel}: [${no.chaves.join(", ")}]`);
        if (!no.ehFolha) {
            for (let i = 0; i < no.filhos.length; i++) {
                let novoPrefixo = prefixo + (nivel > 0 ? "│   " : "");
                if (i === no.filhos.length - 1) novoPrefixo = prefixo + (nivel > 0 ? "    " : "");
                this.imprimirArvoreAninhada(no.filhos[i], nivel + 1, novoPrefixo);
            }
        }
    }
}
// Definição da classe SGBDSimples para gerenciar o banco de dados com a árvore B
class SGBDSimples {
    constructor(ordem) {
        this.arvoreB = new ArvoreB(ordem); // Inicializa a árvore B com a ordem especificada.
        this.bancoDeDados = {}; // Armazena os registros como um objeto JavaScript.
        this.carregarBancoDeDados(); // Carrega o banco de dados de um arquivo JSON, se disponível.
    }

    insert(chave, valor) {
        console.time('Tempo de Inserção'); // Inicia o cronômetro para a inserção.
        const memoriaAntes = process.memoryUsage().heapUsed; // Captura o uso de memória antes da inserção.
        
        if (!this.bancoDeDados.hasOwnProperty(chave)) { // Verifica se a chave não existe no banco de dados.
            this.arvoreB.inserir(chave); // Insere a chave na Árvore B.
            this.bancoDeDados[chave] = valor; // Adiciona o registro ao banco de dados.
            this.salvarBancoDeDados(); // Salva o banco de dados após a inserção.
            console.log(`Registro com chave ${chave} inserido com sucesso.`);
        } else {
            console.log(`Erro: Chave ${chave} já existe.`);
        }

        const memoriaDepois = process.memoryUsage().heapUsed; // Captura o uso de memória após a inserção.
        console.timeEnd('Tempo de Inserção'); // Finaliza o cronômetro e exibe o tempo de inserção.
        console.log(`Memória utilizada para inserção: ${(memoriaDepois - memoriaAntes) / 1024} KB`);
    }

    select(chave) {
        console.time('Tempo de Busca'); // Inicia o cronômetro para a busca.
        const memoriaAntes = process.memoryUsage().heapUsed; // Captura o uso de memória antes da busca.

        let no = this.arvoreB.buscar(this.arvoreB.raiz, chave);
        if (no) {
            console.log(`Registro encontrado: Chave: ${chave}, Valor: ${this.bancoDeDados[chave]}`);
        } else {
            console.log(`Erro: Chave ${chave} não encontrada.`);
        }

        const memoriaDepois = process.memoryUsage().heapUsed; // Captura o uso de memória após a busca.
        console.timeEnd('Tempo de Busca'); // Finaliza o cronômetro e exibe o tempo de busca.
        console.log(`Memória utilizada para busca: ${(memoriaDepois - memoriaAntes) / 1024} KB`);
    }

    update(chave, novoValor) {
        console.time('Tempo de Atualização'); // Inicia o cronômetro para a atualização.
        const memoriaAntes = process.memoryUsage().heapUsed; // Captura o uso de memória antes da atualização.

        if (this.bancoDeDados.hasOwnProperty(chave)) { // Verifica se a chave existe no banco de dados.
            this.bancoDeDados[chave] = novoValor; // Atualiza o valor do registro.
            this.salvarBancoDeDados(); // Salva o banco de dados após a atualização.
            console.log(`Registro com chave ${chave} atualizado com sucesso.`);
        } else {
            console.log(`Erro: Chave ${chave} não encontrada para atualização.`);
        }

        const memoriaDepois = process.memoryUsage().heapUsed; // Captura o uso de memória após a atualização.
        console.timeEnd('Tempo de Atualização'); // Finaliza o cronômetro e exibe o tempo de atualização.
        console.log(`Memória utilizada para atualização: ${(memoriaDepois - memoriaAntes) / 1024} KB`);
    }

    delete(chave) {
        console.time('Tempo de Remoção'); // Inicia o cronômetro para a remoção.
        const memoriaAntes = process.memoryUsage().heapUsed; // Captura o uso de memória antes da remoção.

        let no = this.arvoreB.buscar(this.arvoreB.raiz, chave);
        if (no) {
            this.arvoreB.remover(chave); // Remove a chave da Árvore B.
            delete this.bancoDeDados[chave]; // Remove o registro do banco de dados.
            this.salvarBancoDeDados(); // Salva o banco de dados após a remoção.
            console.log(`Registro com chave ${chave} removido com sucesso.`);
        } else {
            console.log(`Erro: Chave ${chave} não encontrada para remoção.`);
        }

        const memoriaDepois = process.memoryUsage().heapUsed; // Captura o uso de memória após a remoção.
        console.timeEnd('Tempo de Remoção'); // Finaliza o cronômetro e exibe o tempo de remoção.
        console.log(`Memória utilizada para remoção: ${(memoriaDepois - memoriaAntes) / 1024} KB`);
    }

    imprimirTabela() {
        console.log("\nTabela do SGBD:");
        console.log("Chave\tValor");
        console.log("-----------------");
        for (let chave in this.bancoDeDados) {
            console.log(`${chave}\t${this.bancoDeDados[chave]}`);
        }
        console.log("-----------------\n");
    }

    gerarDadosAleatorios(quantidade) {
        console.log(`\nGerando ${quantidade} registros aleatórios...\n`);
        for (let i = 0; i < quantidade; i++) {
            let chave = Math.floor(Math.random() * 1000); // Gera uma chave aleatória.
            let valor = `Valor ${chave}`; // Gera um valor correspondente à chave.
            this.arvoreB.inserir(chave); // Insere a chave diretamente na Árvore B.
            this.bancoDeDados[chave] = valor; // Adiciona o registro ao banco de dados sem mensagens no console.
        }
        this.salvarBancoDeDados(); // Salva o banco de dados após gerar registros aleatórios.
        console.log("Geração de dados aleatórios concluída.");
    }

    excluirArvore() {
        this.arvoreB = null; // Remove a árvore da memória
        this.bancoDeDados = {}; // Limpa o banco de dados em memória

        // Remove arquivos JSON se existirem
        if (fs.existsSync('arvoreB.json')) {
            fs.unlinkSync('arvoreB.json');
        }
        if (fs.existsSync('bancoDeDados.json')) {
            fs.unlinkSync('bancoDeDados.json');
        }

        console.log("Árvore e banco de dados excluídos com sucesso.");
    }

    // Função para salvar o banco de dados em um arquivo JSON
    salvarBancoDeDados() {
        const json = JSON.stringify(this.bancoDeDados, null, 2);
        fs.writeFileSync('bancoDeDados.json', json, 'utf8');
    }

    // Função para carregar o banco de dados de um arquivo JSON
    carregarBancoDeDados() {
        if (fs.existsSync('bancoDeDados.json')) {
            const jsonData = fs.readFileSync('bancoDeDados.json', 'utf8');
            this.bancoDeDados = JSON.parse(jsonData);
        }
    }
}

const prompt = require('prompt-sync')(); // Biblioteca para obter input do usuário

function menu() {
    let sgbd = new SGBDSimples(5); // Inicializa o SGBD com uma Árvore B de ordem 5

    while (true) {
        console.log("\nMenu de Operações:");
        console.log("1 - Inserir um dado na Árvore");
        console.log("2 - Buscar por um dado na Árvore");
        console.log("3 - Atualizar um dado na Árvore");
        console.log("4 - Remover um dado da Árvore");
        console.log("5 - Inserir dados aleatórios na Árvore");
        console.log("6 - Mostrar a Árvore");
        console.log("7 - Excluir a Árvore");
        console.log("0 - Sair do Menu");

        const opcao = prompt("Escolha uma operação: "); // Lê a opção escolhida pelo usuário

        switch (opcao) {
            case '1':
                const chaveInserir = parseInt(prompt("Digite a chave para inserir: "));
                const valorInserir = prompt("Digite o valor para inserir: ");
                sgbd.insert(chaveInserir, valorInserir);
                break;
            case '2':
                const chaveBuscar = parseInt(prompt("Digite a chave para buscar: "));
                sgbd.select(chaveBuscar);
                break;
            case '3':
                const chaveAtualizar = parseInt(prompt("Digite a chave para atualizar: "));
                const novoValor = prompt("Digite o novo valor: ");
                sgbd.update(chaveAtualizar, novoValor);
                break;
            case '4':
                const chaveRemover = parseInt(prompt("Digite a chave para remover: "));
                sgbd.delete(chaveRemover);
                break;
            case '5':
                const quantidade = parseInt(prompt("Digite a quantidade de registros aleatórios para inserir: "));
                sgbd.gerarDadosAleatorios(quantidade);
                break;
            case '6':
                if (sgbd.arvoreB) { // Verifica se a árvore ainda existe
                    console.log("Estado atual da Árvore B:");
                    sgbd.arvoreB.imprimirArvoreAninhada(); // Chama a função para imprimir a árvore de forma aninhada
                } else {
                    let sgbd = new SGBDSimples(5); // Inicializa o SGBD com uma Árvore B de ordem 5
                    sgbd.arvoreB.imprimirArvoreAninhada(); // Chama a função para imprimir a árvore de forma aninhada
                }
                break;
            case '7':
                console.log("Árvore excluída.");
                sgbd.excluirArvore();
                break;
            case '0':
                console.log("Saindo do menu.");
                return; // Sai do loop e termina o programa
            default:
                console.log("Opção inválida! Por favor, escolha uma operação válida.");
        }
    }
}

// Chama a função de menu para iniciar a interação com o usuário
menu();
