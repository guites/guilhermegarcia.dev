+++
title = "Procedimentos e processos - o modelo da substituição"
date = "2024-02-09T22:13:34-03:00"
description = ""
tags = ['português', 'algoritmos', 'lisp']
slug = 'procedimentos-e-processos-aula-1b'
toc = true
draft = false
+++

## Introdução

Este post é o meu resumo da aula "Procedures and processes - substitution model" do curso **MIT 6.001 Structure and Interpretation**, de 1986.

![its the poster for "Structure & Interpretation of Computer Programs" by Harold Abelson and Gerald Jay Sussman. It features a wizardly man with a gray, long beard, and a purple robe with stars](./structure-and-interpretations-splash.png)

Se você não conhece, esse curso é baseado no livro [Structure and Interpretation of Computer Programs](https://web.mit.edu/6.001/6.037/sicp.pdf) e foi lecionado pelos próprios autores :).

Nesta aula, vemos como utilizar o **modelo da substituição** (substituition model) para entender como um computador avalia uma aplicação.

## Modelo da substituição

Essas aplicações são algoritmos, ou conjunto de regras utilizadas para realizar cálculos e manipulações numéricas.

Os algoritmos são compostos de diversas expressões:

- Números
- Símbolos
- Expressões Lambda **\***
- Definições **\***
- Condicionais **\***
- Combinações

**\***: Estes são casos especiais que possuem regras específicas.

Como números são avaliados como eles mesmos (um `7` é interpretado como o valor `7` pelo computador), e, no modelo da substituição, os símbolos são removidos, a compreensão do modelo depende da forma como avaliamos combinações.

> **Regra da substituição**
> 
> Para avaliar uma aplicação<br/>
> \- Avalie o operador para conseguir o procedimento<br/>
> \- Avalie os operandos para conseguir os argumentos<br/>
> \- Aplique o procedimento aos argumentos<br/>
> --- Copie o corpo do procedimento,
> substituindo os argumentos fornecidos pelos parâmetros formais
> do procedimento.<br/>
> --- Avalie o novo corpo resultante.

## A soma de dois quadrados

<aside>O código abaixo é escrito em lisp. Lisp tem um padrão um pouco diferente do utilizado em linguagens como javascript e python, mas, pra essa aula, tudo que você precisa saber é que o operador antecede os operandos.

Algo que, em python, seria definido como

```python
# bom e velho python
1 + 1
# 2
```

vai ser apresentado com o operador primeiro:

```lisp
// LISP !!
+ 1 1
// 2
```
</aside>

O exemplo inicial é a soma de dois quadrados: dados dois números, calcule a soma de seus quadrados.

<aside>

O _dialeto_ de lisp utilizado é o [Scheme](scheme.org). Você pode rodar Scheme usando compiladores online, como o disponível [aqui](https://inst.eecs.berkeley.edu/~cs61a/fa14/assets/interpreter/scheme.html))
</aside>

```lisp
(define (sos x y) (+ (square x) (square y)))

(define (square x) (* x x))

(sos 3 4)
// 25
```

<aside>A expressão <code>define</code> funciona como o <code>def</code> no python, e possibilita a criação de função (e também variáveis).

O bloco acima pode ser pensado em python como

```python
def sos(x, y):
  return square(x) + square(y)

def square(x):
  return x * x

sos(3, 4)
# 25
```
</aside>

Aplicando a regra da substituição, começamos substituindo os valores `3` por `x`, e `4` por `y`.

```lisp
(sos 3 4)
(+ (square 3) (square 4))
(+ (square 3) (* 4 4))
(+ (square 3) 16)
(+ (* 3 3) 16)
(+ 9 16)
```

## Condicionais

Podemos ver também as regras referentes às expressões _condicionais_.

> Para avaliar uma expressão IF<br/>
> \- Avalia a expressão do predicado (predicate)<br/>
> \-\- Se ela for VERDADEIRA<br/>
> \-\-\- avalie a expressão consequente (consequent)<br/>
> \-\- Se não<br/>
> \-\-\- avalie a expressão alternativa (alternative)

Na sintase do lisp, temos algo no formato:

```
(if <predicate>
    <consequent>
    <alternative>)
```

O funcionamento do `if` pode ser ilustrado através de um programa, a soma de x e y, feito através da [_aritmética de Peano_](https://en.wikipedia.org/wiki/Peano_axioms#Defining_arithmetic_operations_and_relations), limitada a operações de adição e subtração.

```lisp
(define (sub1 x) (- x 1))

(define (incr1 x) (+ x 1))

(define (add x y)
  (if (= x 0)
    y
    (add (sub1 x) (incr1 y))))

(add 3 4)
// 7
```

Repare que a função `add` é _recursiva_: ela chama a si mesmo até atingir uma condição específica (quando `x` for `0`), momento na qual ela retorna um valor específico, quebrando o loop.

Podemos compreender a função `add` melhor aplicando a subsituição:

```lisp
(add 3 4)
// x é diferente de zero
(add (sub1 3) (incr1 4))
(add (- 3 1) (+ 4 1))
(add 2 5)
// x ainda é diferente de zero
(add (sub1 2) (incr1 5))
(add (- 2 1) (+ 5 1))
(add 1 6)
// x ainda é diferente de zero
(add (sub1 1) (incr1 6))
(add (- 1 1) (+ 6 1))
(add 0 7)
// x é igual a zero!! retornamos y (7)
```

## Intuição - recursividade e iteração

De acordo com o livro, um procedimento é um **padrão para a evolução local de um processo computacional**. Esses padrões podem ser descritos em função de como eles consomem **recursos computacionais** de espaço e tempo.

> A procedure is a pattern for the local evolution of a computational
> process. It specifies how each stage of the process is built upon the previ-
> ous stage. We would like to be able to make statements about the overall,
> or global, behavior of a process whose local evolution has been specified
> by a procedure. This is very difficult to do in general, but we can at least
> try to describe some typical patterns of process evolution.

O algoritmo `add` demonstrado anteriormente tem a seguinte evolução:

```
(add 3 4) |
(add 2 5) |
(add 1 6) | time
(add 0 7) |
7         v
```

Caso aumentarmos o problema somando, por exemplo, `4` e `4`, o algoritmo iria precisar de um passo adicional, aumentando, linearmente, o tempo de execução.

Uma versão alternativa do mesmo algoritmo pode ser implementado da seguinte forma:

```lisp
(define (sub1 x) (- x 1))

(define (incr1 x) (+ x 1))

(define (add_alt x y)
  (if (= x 0)
    y
    (incr1 (add_alt (sub1 x) y))))

(add_alt 3 4)
// 7
```

Ele revela o seguinte padrão ao aplicarmos a substituição:

```
(add_alt 3 4)
// x é diferente de zero
(incr1 (add_alt (sub1 3) 4))
(incr1 (add_alt 2 4))
// x segue diferente de zero
(incr1 (incr1 (add_alt (sub1 2) 4)))
(incr1 (incr1 (add_alt 1 4)))
// x ainda é diferente de zero!
(incr1 (incr1 (incr1 (add_alt (sub1 1) 4))))
(incr1 (incr1 (incr1 (add_alt 0 4))))
// x é zero! podemos retornar o valor de y
(incr1 (incr1 (incr1 4)))
// agora vamos aplicando os incrementos
(incr1 (incr1 5))
(incr1 6)
7
```

Se focarmos apenas na evolução do algoritmo, temos esse padrão:

```
(add_alt 3 4)                      \
(incr1 (add_alt 2 4))               \
(incr1 (incr1 (add_alt 1 4)))        \
(incr1 (incr1 (incr1 (add_alt 0 4)))) |
(incr1 (incr1 (incr1 4)))            /
(incr1 (incr1 5))                   /
(incr1 6)                          /
7                                 / 
```

O formato de expansão seguida de contração ocorre quando temos um aumento de _operações deferidas_ (neste caso, as operações de incremento). A contração ocorre conforme as operações são realizadas.

Este tipo de processo é denomeado **processo recursivo**. Para que seja realizado o interpretador precisa manter um registro das operações que devem ser realizadas no futuro.

No exemplo acima, o número de incrementos cresce linearmente com o valor de `x` passado na função (é _proporcional_ a `x`), e, portanto, pode ser chamado de um **processo linearmente recursivo**.

No primeiro exemplo não existe essa expansão/contração. Em cada passo, toda informação que precisamos está explícita nos argumentos `x` e `y` da função.

```lisp
(add 1 6)
```

Esse tipo de processo é chamado de **processo iterativo**. Um processo iterativo é um no qual o seu estado pode ser descrito por um número fixo de **variáveis de estado**, juntos à uma regra fixa que define como as variáveis de estado devem ser atualizadas conforme o processo evolui de passo a passo.

Na nossa função `add`, o número de passo cresce linearmente com `x` (pois é `x` que define o critério de parada da função, quando `x = 0`). Pode ser chamado, portanto, de **processo linearmente iterativo**.

![Formas de visualizar operações iterativas vs. recursivas para o algoritmo de adição: na iterativa, as bolas (valores) são passados diretamente de uma pilha (x) para outra (y), enquanto na recursiva elas são primeiro enviadas para uma terceira pilha (operações deferidas), e depois dessa pilha para a pilha y.](./iter-vs-reccr.png)
