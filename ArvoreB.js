class NoB {
    constructor(ordem, ehFolha = true) {
        this.ordem = ordem; // Ordem da árvore B
        this.ehFolha = ehFolha; // Indica se o nó é uma folha
        this.chaves = []; // Armazena as chaves do nó
        this.filhos = []; // Armazena os filhos do nó
    }
}


class ArvoreB {
    constructor(ordem) {
        this.raiz = new NoB(ordem); // Inicializa a árvore com um nó raiz
        this.ordem = ordem;
    }

    // Verifica se a raiz está cheia, ou seja, tem o número máximo de chaves.
    inserir(chave) {
        let raiz = this.raiz;

        // Se a raiz está cheia, é necessário dividir
        if (raiz.chaves.length === 2 * this.ordem - 1) {
            let novaRaiz = new NoB(this.ordem, false);
            novaRaiz.filhos.push(raiz);
            this.dividirNo(novaRaiz, 0, raiz);
            this.raiz = novaRaiz;
            this.inserirNaoCheio(novaRaiz, chave);
        } else {
            this.inserirNaoCheio(raiz, chave);
        }
    }

    inserirNaoCheio(no, chave) {
        let i = no.chaves.length - 1;

        if (no.ehFolha) {
            no.chaves.push(0);
            while (i >= 0 && chave < no.chaves[i]) {
                no.chaves[i + 1] = no.chaves[i];
                i--;
            }
            no.chaves[i + 1] = chave;
        } else {
            while (i >= 0 && chave < no.chaves[i]) {
                i--;
            }
            i++;
            if (no.filhos[i].chaves.length === 2 * this.ordem - 1) {
                this.dividirNo(no, i, no.filhos[i]);
                if (chave > no.chaves[i]) {
                    i++;
                }
            }
            this.inserirNaoCheio(no.filhos[i], chave);
        }
    }

    dividirNo(noPai, i, noCheio) {
        let novoNo = new NoB(this.ordem, noCheio.ehFolha);
        novoNo.chaves = noCheio.chaves.splice(this.ordem, this.ordem - 1);
        if (!noCheio.ehFolha) {
            novoNo.filhos = noCheio.filhos.splice(this.ordem, this.ordem);
        }

        noPai.filhos.splice(i + 1, 0, novoNo);
        noPai.chaves.splice(i, 0, noCheio.chaves.pop());
    }

     // Percorre as chaves do nó até encontrar uma chave maior ou igual à chave que está sendo buscada.
    buscar(no, chave) {
        let i = 0;
        while (i < no.chaves.length && chave > no.chaves[i]) {
            i++;
        }

        if (i < no.chaves.length && chave === no.chaves[i]) {
            return no;// Retorna o nó que contém a chave.
        }

        if (no.ehFolha) {
            return null;
        } else {
            return this.buscar(no.filhos[i], chave);
        }
    }

    remover(chave) {
        if (!this.raiz) {
            console.log("A árvore está vazia.");
            return;
        }

        this.removerChave(this.raiz, chave);

        if (this.raiz.chaves.length === 0) {
            this.raiz = this.raiz.ehFolha ? null : this.raiz.filhos[0];
        }
    }

    removerChave(no, chave) {
        let i = 0;
        while (i < no.chaves.length && chave > no.chaves[i]) {
            i++;
        }

        if (i < no.chaves.length && chave === no.chaves[i]) {
            if (no.ehFolha) {
                no.chaves.splice(i, 1);
            } else {
                this.removerChaveInterna(no, i);
            }
        } else {
            if (no.ehFolha) {
                console.log(`Chave ${chave} não encontrada.`);
                return;
            }
            let ehFilhoFolha = i === no.chaves.length;
            let filho = no.filhos[i];
            if (filho.chaves.length < this.ordem) {
                this.preencherFilho(no, i);
                if (ehFilhoFolha && i > no.chaves.length) {
                    i--;
                }
            }
            this.removerChave(no.filhos[i], chave);
        }
    }

    imprimirArvore(no = this.raiz, nivel = 0) {
        console.log("Nível " + nivel + ": " + no.chaves.join(", "));
        if (!no.ehFolha) {
            for (let filho of no.filhos) {
                this.imprimirArvore(filho, nivel + 1);
            }
        }
    }
}


class SGBDSimples {
    constructor(ordem) {
        this.arvoreB = new ArvoreB(ordem); // Inicializa a árvore B com a ordem especificada.
        this.bancoDeDados = {}; // Armazena os registros como um objeto JavaScript.
    }

    insert(chave, valor) {
        console.time('Tempo de Inserção'); // Inicia o cronômetro para a inserção.
        if (!this.bancoDeDados.hasOwnProperty(chave)) { // Verifica se a chave não existe no banco de dados.
            this.arvoreB.inserir(chave); // Insere a chave na Árvore B.
            this.bancoDeDados[chave] = valor; // Adiciona o registro ao banco de dados.
            console.log(`Registro com chave ${chave} inserido com sucesso.`);
        } else {
            console.log(`Erro: Chave ${chave} já existe.`);
        }
        console.timeEnd('Tempo de Inserção');
        console.log("Estado atual da Árvore B após inserção:");
        this.arvoreB.imprimirArvore();
        this.imprimirTabela(); // Imprime o estado atual do banco de dados após a inserção.
    }

    select(chave) {
        console.time('Tempo de Busca'); // Inicia o cronômetro para a busca.
        let no = this.arvoreB.buscar(this.arvoreB.raiz, chave);
        if (no) {
            console.log(`Registro encontrado: Chave: ${chave}, Valor: ${this.bancoDeDados[chave]}`);
        } else {
            console.log(`Erro: Chave ${chave} não encontrada.`);
        }
        console.timeEnd('Tempo de Busca');
    }

    update(chave, novoValor) {
        console.time('Tempo de Atualização'); // Inicia o cronômetro para a atualização.
        if (this.bancoDeDados.hasOwnProperty(chave)) { // Verifica se a chave existe no banco de dados.
            this.bancoDeDados[chave] = novoValor; // Atualiza o valor do registro.
            console.log(`Registro com chave ${chave} atualizado com sucesso.`);
        } else {
            console.log(`Erro: Chave ${chave} não encontrada para atualização.`);
        }
        console.timeEnd('Tempo de Atualização');
        console.log("Estado atual da Árvore B após atualização:");
        this.arvoreB.imprimirArvore();
        this.imprimirTabela(); // Imprime o estado atual do banco de dados após a atualização.
    }

    delete(chave) {
        console.time('Tempo de Remoção'); // Inicia o cronômetro para a remoção.
        let no = this.arvoreB.buscar(this.arvoreB.raiz, chave);
        if (no) {
            this.arvoreB.remover(chave); // Remove a chave da Árvore B.
            delete this.bancoDeDados[chave]; // Remove o registro do banco de dados.
            console.log(`Registro com chave ${chave} removido com sucesso.`);
        } else {
            console.log(`Erro: Chave ${chave} não encontrada para remoção.`);
        }
        console.timeEnd('Tempo de Remoção');
        console.log("Estado atual da Árvore B após remoção:");
        this.arvoreB.imprimirArvore();
        this.imprimirTabela(); // Imprime o estado atual do banco de dados após a remoção.
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
            this.insert(chave, valor); // Insere o registro no banco de dados.
        }
        console.log("Geração de dados aleatórios concluída.");
    }
}

let sgbd = new SGBDSimples(3);

sgbd.gerarDadosAleatorios(100); 
// Inserindo registros
sgbd.insert(10, "Registro A");
sgbd.insert(20, "Registro B");
sgbd.insert(5, "Registro C");

// Selecionando registros
sgbd.select(10);
sgbd.select(15); // Não encontrado

// Atualizando um registro
sgbd.update(20, "Registro B Atualizado");

// Deletando um registro
sgbd.delete(5);
sgbd.select(5); // Não encontrado após exclusão
