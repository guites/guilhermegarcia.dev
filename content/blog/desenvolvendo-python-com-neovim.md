+++
title = "Desenvolvendo Python com Neovim"
date = "2026-03-26T17:15:57-03:00"
lastmod = "2026-04-30T16:15:32-03:00"

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

Pra que eu não precise voltar pro vscode, esses pontos são fundamentais:

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

- **Resolver conflitos de merge**

    Isso eventualmente acontece e, em arquivos como `uv.lock` e `package.json`s
da vida, em que fica fora de mão ajustar manualmente os blocos `>>>>>>> main`,
eu preciso de uma forma fácil de visualizar e aceitar ou editar código em conflito.

<aside>se você quer um passo a passo de como instalar o neovim e o pacote kickstart, veja <a href="https://sektant.dev/posts/tutorials/how-to-setup-neovim/">esse post</a>, que tmb mostra o uso do depurador pra js</aside>

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

<aside>Caso o pyright dê erro na instalação, é provável que seja pq você
não tem o `npm` disponível no seu path. Confira se você tem o node instalado,
e, se não tiver, instale usando o
<a href="https://github.com/nvm-sh/nvm">nvm</a></aside>

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

Lembrar do `:MasonInstall debugpy`.

Instalar parser de tree sitter para python (permite chamada do depurador para a função atual ou classe atual)

```diff
diff --git a/init.lua b/init.lua
index 31a2a60..8573ae3 100644
--- a/init.lua
+++ b/init.lua
@@ -872,7 +872,7 @@ require('lazy').setup({
     branch = 'main',
     -- [[ Configure Treesitter ]] See `:help nvim-treesitter-intro`
     config = function()
-      local parsers = { 'bash', 'c', 'diff', 'html', 'lua', 'luadoc', 'markdown', 'markdown_inline', 'query', 'vim', 'vimdoc' }
+      local parsers = { 'bash', 'c', 'diff', 'html', 'lua', 'luadoc', 'markdown', 'markdown_inline', 'query', 'vim', 'vimdoc', 'python' }
       require('nvim-treesitter').install(parsers)
       vim.api.nvim_create_autocmd('FileType', {
         callback = function(args)
```

## Integração com Docker

A estratégia é instalar o nvim **dentro** do container! Como ele funciona todo
dentro do terminal, você pode usar um `docker exec` pra dar ssh pra dentro do
container e fazer tudo por ali, sem precisar instalar nada na sua máquina.

<aside>Você não precisa nem mesmo ter o nvim no seu host, o que é ótimo
pra fazer setups rápidos em máquinas temporárias.</aside>

O script abaixo que automatiza a instalação de tudo que é necessário no container.

Eu fiz ele pensando em um container rodando Debian, mas esses passos devem
funcionar pra Ubuntu também.

Primeiro verifique qual a distro do container na qual você quer desenvolver:

```bash
docker exec -it meu_app bash
cat /etc/os-release | grep ID
```

Se não for Debian ou Ubuntu, recomendo dar uma analisada no script e adaptar
conforme a necessidade (acho que o mais importante é mudar apt-get
pro gerenciador de pacotes da sua distro - use a sessão
[Linux Install](https://github.com/nvim-lua/kickstart.nvim?tab=readme-ov-file#linux-install)
do kickstart.nvim como referência).

Salve o script como `nvim-setup.sh` e altere a variável `CONTAINER_NAME` pro
nome que estiver utilizando.

```bash
#!/bin/bash
# setup-nvim.sh by guites
# more info:
# https://guilhermegarcia.dev/blog/desenvolvendo-python-com-neovim
# glhf

set -e

if [ -z "$1" ]; then
  echo "CONTAINER_NAME not defined. Exiting."
  echo "Usage: ./setup_nvim.sh <CONTAINER_NAME>"
  exit 1
fi

CONTAINER_NAME="$1"
KICKSTART_NVIM_REPO="guites"

docker exec -i -u root "$CONTAINER_NAME" bash -seu <<'EOF'
  apt-get update
EOF

docker exec -i "$CONTAINER_NAME" bash -seu <<'EOF'
  if ! node -v >/dev/null 2>&1; then
    echo "node não encontrado. Instalando via nvm..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
    nvm install --lts
  fi
EOF

docker exec -i -u root "$CONTAINER_NAME" bash -seu <<'EOF'
  # dependências para os pacotes básicos (LSPs, busca, uso do clipboard)
  apt-get install -y make gcc ripgrep fd-find tree-sitter-cli unzip git xclip curl

  # instalação do nvim
  if ! nvim -v >/dev/null 2>&1; then
    echo "nvim não encontrado. Instalando..."
    curl -LO https://github.com/neovim/neovim/releases/latest/download/nvim-linux-x86_64.tar.gz
    rm -rf /opt/nvim-linux-x86_64
    mkdir -p /opt/nvim-linux-x86_64
    chmod a+rX /opt/nvim-linux-x86_64
    tar -C /opt -xzf nvim-linux-x86_64.tar.gz
    ln -sf /opt/nvim-linux-x86_64/bin/nvim /usr/local/bin/
    rm nvim-linux-x86_64.tar.gz
  fi
EOF

docker exec -i "$CONTAINER_NAME" bash -seu <<'EOF'
  grep -qxF "alias vim='nvim'" "$HOME/.bashrc" || echo "alias vim='nvim'" >> "$HOME/.bashrc"
  # instalação do kickstart.nvim
  mkdir -p "$HOME/.config"
  # se você possui seu próprio fork do kickstart.nvim,
  # substitua "guites" pelo seu usuário do github
  # se você quer usar a versão limpa sem as minhas alterações,
  # substitua "guites" por "nvim-lua"
  NVIM_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/nvim"
  if [ ! -d "$NVIM_DIR/.git" ]; then
    echo "configuração do nvim não encontrada. Inicializando via kickstart.nvim..."
    rm -rf "$NVIM_DIR"
    git clone https://github.com/guites/kickstart.nvim.git "$NVIM_DIR"
  fi
EOF
```

Rode com `bash nvim-setup.sh`.

Depois você pode acessar o container via `docker exec` e
rodar o nvim lá dentro!

```bash
docker exec -it meu_app bash
nvim
```

### Permitindo uso do clipboard

Isso permite copiar linhas de código direto do nvim
e colar em outro lugar (por ex. <kbd>ctrl + shift + v + y</kbd>
e depois <kbd>ctrl + v</kbd> num outro programa).

Não é essêncial mas ajuda a dar aquela sensação de que você está
desenvolvendo localmente :).

O método pra sincronizar o clipboard do nvim com a sua máquina é através do xclip.

O xclip precisa ter acesso ao ambiente gráfico (`$DISPLAY`) da sua máquina, e
pra isso você vai ter que compartilhar esse acesso com o container do docker.

A forma mais prática que eu achei é criar um arquivo docker-compose.nvim.yml e adicionar
um volume extra no serviço onde você vai abrir o nvim.

```yaml
# arquivo docker-compose.nvim.yml
services:
  meu_app:
    volumes:
      - /tmp/.X11-unix:/tmp/.X11-unix
    environment:
      - DISPLAY=${DISPLAY}
```

Você precisa também permitir acesso de processos locais ao seu display com

```bash
xhost +local:
```

<aside>Pra desfazer esse permissionamento, rode <code>xhost -local:</code></aside>

E daí pra acessar seu container:

```bash
# na hora de criar o container, usar o .yaml adicional
docker compose -f docker-compose.yml -f docker-compose.nvim.yml up meu_app -d
docker exec -it meu_app bash
```

## (wip) Resolvendo conflitos de merge

vim-fugitive!

- <https://www.youtube.com/watch?v=vpwJ7fqD1CE>
- <https://github.com/tpope/vim-fugitive>
- :Gvdiffsplit!
  - target branch na esquerda - o branch no qual você estava (//2)
  - merge branch na direita - o branch do qual você está pegando o código (//3)
  - working copy no meio - o código misturado
- `:diffget` para puxar as alterações de um dos lados para a working copy

Exige um pequeno ajuste no init.lua, devido a um bug registrado no nvim:

```diff
# em init.lua
+vim.opt.diffopt:remove 'linematch:40'

+  { 'tpope/vim-fugitive' },
```

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
