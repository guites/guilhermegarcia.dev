+++
title = "Desenvolvendo Python com Neovim"
date = "2026-03-26T17:15:57-03:00"

description = "Como eu adaptei o uso do neovim pra ficar mais próximo do que eu estava acostumado no vscode. Navegação na codebase, uso do depurador e integração com docker."
toc = true

tags = ["cli","português","python","vim",]
+++

<aside class="warning">Post em constante evolução, atualizado conforme eu
avançar nas configurações.</aside>

Resolvi tentar mais uma vez arrumar um ambiente pra desenvolvimento com vim.

Eu sempre acabo desistindo quando preciso usar funcionalidades mais chatinhas de
configurar, como setup de depurador, linters/formaters, busca de definições
(classes e funções), essas coisas.

Como mudei de computador, aproveitei pra começar do zero, e dessa vez instalei
o neovim, usando o template [kickstart nvim](https://github.com/nvim-lua/kickstart.nvim).

Ele já vem com várias configurações prontas, tipo uso do tree-sitter e
do lazy vim pra configuração rápida de plugins.

Pra que eu não precise voltar pro vscode, três coisas são fundamentais:

- **Navegar na codebase** por referências, incluindo código fonte das bibliotecas

    Esse é o fluxo de, no vscode, ir dando ctrl+clique nas classes e funções
até encontrar a implementação. Eu faço isso com **muita** frequência e não
faz sentido ter que sair do meu editor pra ir buscar o código fonte na internet.

- **Depurar projetos** e suítes de teste

    Projetos que usam frameworks como Flask, Django ou FastAPI tem formas específica
de inicialização (`manage.py runserver` ou `flask run app`) e podem ter mais
de um ponto de entrada, aceitar diferentes flags, etc. Também tenho que
conseguir adicionar breakpoints em testes, geralmente com `pytest`.

- **Integração com docker**

    A maioria dos ambientes devs são distribuidos assim, e eu gostaria de conseguir
plugar as funcionalidades do editor em arquivos que estão dentro dos containers,
pra não precisar ficar instalando tudo localmente. Seria um equivalente ao
"attach to container" do vscode, que funciona super bem.

## Navegando na codebase

Essa foi a parte mais fácil, graças ao [kickstart.nvim](https://github.com/nvim-lua/kickstart.nvim).

O que eu fiz foi incrementar as configurações padrões com alguns detalhes.

### Configurar LSP pra Python

Isso é o que vai te permitir navegar através da codebase, tanto do seu código
quanto das bibliotecas importadas.

Lá no init.lua, busque pela variável local `servers`, que define quais
ferramentas vão ser instaladas pelo `Mason`.

```lua
  --  See `:help lsp-config` for information about keys and how to configure
  ---@type table<string, vim.lsp.Config>
  local servers = {
    -- clangd = {},
    -- gopls = {},
    pyright = {},
    bashls = {},
```

No exemplo acima eu adicionei a lsp de Python (`pyright`) e de bash (`bashls`).

<aside>O <a href="https://github.com/mason-org/mason.nvim">Mason</a> faz a gestão de pacotes
instalados no seu nvim. Você pode escolher pacotes manualmente usando o comando
`:Mason`, mas tudo que você colocar no `servers` do init.lua vai ser
instalado automaticamente.</aside>

Depois de instalar o pyright, você vai precisar definir qual ambiente virtual
o pyright deve usar de base. Sem configurar o ambiente virtual, você não vai
conseguir usar o LSP pra navegar nas bibliotecas importadas.

Pra selecionar o ambiente virtual facilmente, tem um plugin chamado [linux-cultist/venv-selector.nvim](https://github.com/linux-cultist/venv-selector.nvim).

No seu init.lua, busque a parte que inicia a instalação de plugins (abertura
da chamada ao lazyvim) e adicione:

```lua
-- NOTE: Here is where you install your plugins.
require('lazy').setup({
  -- NOTE: Plugins can be added via a link or github org/name. To run setup automatically, use `opts = {}`
  -- Instala o plugin de selecionar a venv para python
  {
    'linux-cultist/venv-selector.nvim',
    cmd = 'VenvSelect',
    opts = {
      options = {
        notify_user_on_venv_activation = true,
        override_notify = false,
      },
    },
    --  Call config for Python files and load the cached venv automatically
    ft = 'python',
    keys = { { '<leader>bpv', '<cmd>:VenvSelect<cr>', desc = 'Select VirtualEnv', ft = 'python' } },
  },
```

Ali em `<leader>bpv` é onde eu defino como vou abrir o seletor de ambiente virtual:
pra mim ficou espaço + b + p + v. Você pode escolher qualquer combinação que
achar melhor.

Daí em qualquer projeto que você tenha um .venv instalado, é só usar a
combinação e escolher o executável do python na caixinha que abrir.

### Básico de navegação

Os comandos básicos pra navegar usando as LSPs são os seguintes:

- espaço g r d: pular pra definição. Use esse como você usaria o ctrl+clique
no vscode.
- espaço g r i: pular pra implementação. Alternativa à opção anterior para
linguagens que definem interfaces tipo TypeScript.
- espaço g r t: pular pra definição do tipo. Quando você quer ver onde o tipo (e
não a variável) foi definido.
- ctrl+o (ou também [ctrl+t](https://stackoverflow.com/a/8381488)): voltar pra
onde você estava. Use pra voltar dos pulos que você deu conforme ia indo de
definição em definição.
- espaço g r r: abre uma lista com todos os lugares onde essa palavra é utilizada
- espaço g O: abre uma listagem de todos os símbolos do documento atual. Bom pra
buscar pelo nome de alguma variável.
- espaço g W: igual ao anterior, mas no projeto inteiro.

### <kbd>shift</kbd>+<kbd>k</kbd>: preview de documentação

Visualização rápida de argumentos de função, documentação de classes, etc.

Boa adição aos comandos anteriores pra lembrar das definições sem mudar
o contexto.

Procure por `vim.api.nvim_create_autocmd('LspAttach', {` no seu init.lua e
adicione o seguinte bloco:

```lua
vim.api.nvim_create_autocmd('LspAttach', {
  group = vim.api.nvim_create_augroup('telescope-lsp-attach', { clear = true }),
  callback = function(event)
    local buf = event.buf
    -- o seu init.lua vai ter mais várias coisas aqui

    -- adicione em qualquer lugar dentro desse bloco :)
    map('K', vim.lsp.buf.hover, 'Hover Documentation')
```

## (wip) Uso do depurador

TODO: Escrever sobre o setup do [nvim-dap](https://github.com/mfussenegger/nvim-dap) e como fiz pra criar entrypoints customizados. Fazer uma comparação com o launch.json do vscode!

## (wip) Integração com Docker

TODO: Instalação do neovim **dentro** dos containers como alternativa ao uso de devcontainers e/ou customização dos comandos pra rodar com uma camada adicional de `docker exec`.

## Considerações finais

O maior benefício de usar o vim/neovim (imo) é a proximidade com o terminal.

Navegar com agilidade pelo código, sabendo onde as coisas estão (após decorar alguns
atalhos `¯\_(ツ)_/¯`) facilita digerir grandes volumes de código e
criar um modelo mental correto do que está sendo desenvolvido.

Espero que o nvim te ajude a encontrar o equilibrio entre acessar informação
com agilidade sem sobrecarregar o cérebro com milhares de abas e arquivos.

Eu mantenho a minha configuração sempre atualizada em [github.com/guites/kickstart.nvim](https://github.com/guites/kickstart.nvim),
caso você queria usar como referência.

Abraço!
