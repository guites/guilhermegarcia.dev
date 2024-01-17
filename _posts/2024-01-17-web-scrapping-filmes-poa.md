---
layout: post
title: "Web Scrapping de filmes em Porto Alegre"
date: 2024-01-17 17:29:45 -0300
---

Porto alegre tem várias casas de cinema "de rua": são salas de cinema que passam coleções curadas de filmes novos e antigos, nacionais e internacionais, considerados clássicos ou diferenciados.

Essas casas possuem sites pra divulgação, mas em sua maioria divulgam as sessões pelo Instagram ou Facebook.

E se houvesse um lugar pra você conferir, diariamente, quais filmes estão em cartaz?

Criei o site [CINEMA EM POA](https://guites.github.io/cinemaempoa/) pra divulgar um agregado dos filmes em cartaz em quatro salas daqui de POA:

- [Cinemateca Capitólio](http://www.capitolio.org.br/)
- [Sala Redenção](https://www.ufrgs.br/difusaocultural/salaredencao/)
- [CineBancários](http://cinebancarios.blogspot.com/)
- [Cinemateca Paulo Amorim](https://www.cinematecapauloamorim.com.br/)

Esse post trás um pouco do raciocínio por trás da criação do software, que é um web scrapper escrito em Python.

---

# Encontrando padrões

Eu comecei analisando o site de cada sala de cinema, buscando padrões que eu pudesse utilizar na raspagem dos dados.

Os mais tranquilos foram a Cinemateca Capitólio e a Paulo Amorim, pois os sites são ótimos e muito bem estruturados.

Os mais complicados foram o CineBancários e a Sala Redenção, pois as postagens não seguem uma estrutura HTML fixa, e costumam usar texto livre dentro de tags `<p>` enormes.

## Padrões fáceis

O site do Capitólio tem uma página `/programacao` que aceita parâmetros pra filtrar em função do dia:

![Captura de tela mostrando o parâmetro starting_date na URL do site do capitólio](https://i.imgur.com/XYta0Ke.png "Captura de tela mostrando o parâmetro starting_date na URL do site do capitólio")

Fica fácil descobrirmos, no HTML da página, quais elementos tem quais informações.

    curl "http://www.capitolio.org.br/programacao/?starting_date=2023-08-30&date=2023-08-30#selector" > capitolio.html

E aí, analisando com calma, encontramos o seguinte:

      267         <div class="movie">
      268           <img class="movie-poster" src="http://www.capitolio.org.br/wp-content/uploads/2023/08/cava.jpeg" title="cava" alt="">           <div class="movie-info">
      269           <div class="movie-detail-blocks">
      270             <div class="movie-detail-block">
      271               <img src="http://www.capitolio.org.br/wp-content/themes/capitolio\/images\/icon-time.png">
      272               <span>Horários: 19:00h</span>
      273             </div>
      274             <div class="movie-detail-block">
      275               <img src="http://www.capitolio.org.br/wp-content/themes/capitolio\/images\/icon-sala_de_cinema-room.png">
      276               <span>Sala de Cinema</span>
      277             </div>
      278           </div>
      279             <h1 class="movie-title">Cava</h1>
      280             <div class="movie-subtitle">Entrada franca</div>
      281             <div class="movie-director">
      282               Brasil, 2023, 21 minutos, DCP<br />
      283 <br />
      284 Direção: Hopi Chapman e Karine Emerich<br />
      285             </div>
      286             <p class="movie-text">Com direção de Hopi Chapman (Flow Films) e Karine Emerich (ph7 Filmes), o curta-metragem apresenta registros biográficos de seis décadas de atuação de Wilson Cavalcanti (Pelotas, RS, 1950), a      bordando sua ampla produção em gravura, pintura e desenho. O filme reúne depoimentos do próprio artista e de outros artistas e especialistas na área, como Anico Herskovits, [&hellip;]</p>
      287             <a class="read-more" href="/eventos/6579">leia +</a>
      288           </div>
      289         </div>

Fica fácil escrever um algoritmo que:

1. pega a tag `img` com a classe `.movie-poster`, e acessa o seu atributo `src`.
2. Pega o `<p>` com a classe `.movie-text` e acessa o seu conteúdo, que vira a sinopse.
3. Pega a `<div>` com a classe `.movie-director` e acessa seu `innerText`, que é o diretor.

Conclusão:

![Desenho de um avião com uma faixa dizendo 'deus abençoe o html bem scrito'](http://i.imgur.com/AqCVSZz.png "Desenho de um avião com uma faixa dizendo 'deus abençoe o html bem scrito'")

## Padrões dificeis

E quando o HTML não ajuda? Um exemplo é o site da Sala Redenção, que parece ser gerado por algum editor WYSIWYG, pois ele é meio "texto livre", e as tags não possuem `id`s ou `class`es.

![Imagem de bloco de texto no site da Sala Redenção seguido do HTML equivalente](https://i.imgur.com/G8aZono.jpg "Imagem de bloco de texto no site da Sala Redenção seguido do HTML equivalente")

Repare que não existem classes nem distinção entre blocos contendo o nome do diretor, país do filme, horários de apresentação...

Nesse caso, uma alternativa é acessar todas as tags `<p>` e testar seu conteúdo com um regex ligeiramente, digamos assim, complicado:

    pattern = r"([\w\s]+)\(dir\. ([\w\s]+) \| ([\w\s]+) \| (\d{4}) \| (\d+ min)\)(.*?)((?:\d{1,2} de [a-z]+ \| [\w\-]+ \| \d{1,2}[hH]\s*)+)"

Você pode brincar com esse regex usando o regex101, por esse link: <https://regex101.com/r/gJTkJl/1>.

Conclusão: A raspagem depende da padronização dos dados, e situações como essas, onde o formato pode variar entre as postagens, é uma grande dor de cabeça.

# Gerando o projeto

Convido-os a analisar o código, que é aberto e está no GitHub, nesse repositório: <https://github.com/guites/cinemaempoa>

Obrigado pela atenção!
