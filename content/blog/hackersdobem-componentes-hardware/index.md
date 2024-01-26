+++
title = "Hackers do bem - Identificar Componentes de Hardware de Computador"
date = "2024-01-26T07:45:06-03:00"
slug = "hackers-do-bem-componentes-hardware"
description = "Resumão do segundo módulo de nivelamento do curso hackers do bem: Identificar componentes de hardware de computador"
tags = ["hackersdobem","português"]
+++

Este post é um resumo sobre o conteúdo abordado no segundo módulo de nivelamento do curso [hackers do bem](https://hackersdobem.org.br/) que iniciou em 22/01/2024.

A ideia é compartilhar como o conhecimento de cibersegurança está sendo passado para os [centenas de milhares de inscritos](./email-instabilidade-25-01-2024.png) que vão popular o cenário profissional do país.

## Introdução

Os módulos do nivelamento são:

1. Introdução à cibersegurança [visitar](/blog/hackers-do-bem-introd-ciberseguranca)
1. Identificar componentes de hardware de computador (você está aqui)
1. Compreender Internet e Camada de acesso à rede
1. Compreender acesso a rede e camada de internet (IP)
1. Compreender IPV6 e Camada de transporte
1. Compreender Camada de Aplicação/Serviços de Rede
1. Utilizar Sistemas Operacionais Windows
1. Utilizar Sistemas Operacionais - Linux
1. Lógica de programação
1. Desenvolvimento de Scripts

A ementa do módulo **Componentes de Hardware de Computadores** começa com grandezas computacionais e sistemas numéricos, passa por arquitetura de hardware, identificação de componentes de hardware e termina com a instalação de sistemas operacionais e criação de ambientes virtuais (virtualização).

As aulas são compostas de textos interativos junto à vídeos gravados pelo instrutor Tulio Saji.

## Aula 1: Grandezas computacionais e sistemas numéricos

O início da informática está ligado com a busca por uma resolução rápida de cálculos complexos.

Alguns marcos no desenvolvimento das máquinas utilizadas são:

- Teoria de Boole - Lógica utilizada pelos computadores
- Máquina de Turing - Base teórica para computação
- ENIAC - Primeiro computador digital

Em 1948 surge o termo **bit (b)**, junção das palavras Binary Digit, que representa a menor unidade computacional (0 ou 1).

Depois é definido o **Byte (B)** como o conjunto de 8 bits, usado para representar caracteres através da tabela ASCII.

A [tabela ASCII](https://www.ascii-code.com) é formada por 256 valores, cada um representando um caracter específico:

<details closed>
<summary>Mais info sobre a tabela ascii</summary>

O total de 256 valores é dado pelo tamanho do byte: são oito bits que podem, cada um deles, ter dois valores. Isso dá uma combinação de 2^8 = 256 valores.

Cada valor nesse intervalo pode ser calculado pela soma das potencias de 2 equivalente a sua posição.

Por exemplo, o caractere A ("a maiúsculo") é definido pelo decimal 65, que em binário é 01000001.

O 65 pode ser encontrado partindo de 01000001 pelo cálculo

```
0  1  0  0  0  0  0  1
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |___ 1 * 2^0 = 1 *  1 = 1
|  |  |  |  |  |  |_______0 * 2^1 = 0 *  2 = 0
|  |  |  |  |  |__________0 * 2^2 = 0 *  4 = 0
|  |  |  |  |_____________0 * 2^3 = 0 *  8 = 0
|  |  |  |________________0 * 2^4 = 0 * 16 = 0
|  |  |___________________0 * 2^5 = 0 * 32 = 0
|  |______________________1 * 2^6 = 1 * 64 = 64
|_________________________0 * 2^7 = 0 * 128 = 0

1 + 64 = 65.
```

Da mesma forma, podemos encontrar o equivalente decimal de outros caracteres:

| -   | A   | a   | ç   |
| --- | --- | --- | --- |
| 2^7 | 0   | 0   | 1   |
| 2^6 | 1   | 1   | 1   |
| 2^5 | 0   | 1   | 1   |
| 2^4 | 0   | 0   | 0   |
| 2^3 | 0   | 0   | 0   |
| 2^2 | 0   | 0   | 1   |
| 2^1 | 0   | 0   | 1   |
| 2^0 | 1   | 1   | 1   |
| -   | 65  | 97  | 231 |

- os 31 primeiros valores (do 00000000 até o 00011111) são caracteres de controle, que não podem ser impressos.
- do 32 ao 127, são os caracteres comuns, passíveis de impressão, como os numerais e as letras maiúsculas e minúsculas.
- do 128 ao 255 são os caracteres extendidos, contendo valores como o cedilha (ç), letras acentuadas (á, à, ä) e alguns símbolos como ¼, ¿, ¬.
</details>
