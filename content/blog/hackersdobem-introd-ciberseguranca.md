+++
title = "Hackers do Bem - Introd. à Cibersegurança"
date = "2024-01-25T12:47:34-03:00"
description = "Neste post eu compartilho um pouco do conteúdo coberto no primeiro módulo do curso hackers do bem, que iniciou em 22/01/2024 (após alguns probleminhas no acesso), e que eu comecei a acompanhar no dia 23."
tags = ['hackersdobem', 'cibersecurity', 'português']
slug = 'hackers-do-bem-introd-ciberseguranca'
draft = true
+++

Neste post eu compartilho um pouco do conteúdo coberto no primeiro módulo do curso [hackers do bem](https://hackersdobem.org.br), que iniciou em 22/01/2024 (após alguns probleminhas no acesso), e que eu comecei a acompanhar no dia 23.

Pra quem ficou na dúvida sobre o nível do conteúdo, se deveria fazer o curso ou não, eu espero que esse post ajude a ter uma visão de como a cibersegurança vai ser abordada nesse projeto, que promete profissionalizar estudantes de qualquer nível de formação.

## Introdução

O curso começa obrigatoriamente pelo nivelamento, que é composto de dez módulos.

> O curso aborda introdução à cibersegurança, incluindo tipos de hackers, ethical hacking e as várias profissões no campo, além de arquitetura de computadores e a instalação de sistemas operacionais, camada de aplicação, com foco em serviços essenciais de rede e práticas de segurança, proporcionando uma base sólida para quem busca compreender os fundamentos da TI e cibersegurança.

Os módulos são:

1. Introdução à cibersegurança (**você está aqui**)
2. Identificar componentes de hardware de computador [visitar](/blog/hackers-do-bem-componentes-hardware)
3. Compreender Internet e Camada de acesso à rede
4. Compreender acesso a rede e camada de internet (IP)
5. Compreender IPV6 e Camada de transporte
6. Compreender Camada de Aplicação/Serviços de Rede
7. Utilizar Sistemas Operacionais Windows
8. Utilizar Sistemas Operacionais - Linux
9. Lógica de programação
10. Desenvolvimento de Scripts

O primeiro módulo, **introdução à cibersegurança**, é compostos de textos interativos com vídeos do professor Raphael Nascimento, e cada aula tem uma série de perguntas de multipla escolha revisando os conceitos trabalhados.

Apresento abaixo um resumo do que é trabalhado em cada aula desse módulo.

## Primeira aula: O que é hacker e seus tipos

"Hacker", de acordo com a plataforma, é alguém com grandes habilidades e conhecimento em computação e tecnologia. É um termo neutro, mas foi adquirindo uma conotação negativa, devido à midia e alguns grandes ataques que ocorreram nos anos 70.

Alguns termos são explicados, como "White hat", "Black hat", "Grey hat", "Script kiddie" e "hacktivista".

Também mencionaram a distinção entre "hacker" e "cracker", onde o cracker tem por objetivo causar danos ou extrair informações de um sistema.

Acho que faltou o aviso clássico de Eric Steven Raymond em "How To Become A Hacker" ([fonte](http://catb.org/~esr/faqs/hacker-howto.html))

> If you want to be a cracker, go read the alt.2600 newsgroup and get ready to do five to ten in the slammer after finding out you aren't as smart as you think you are. And that's all I'm going to say about crackers.

## Segunda aula: Conceito de ética

Essa aula é um levantamento sobre as definições de ética e moral. É feita uma contextualização com a área, e citados alguns princípios da LGPD, como:

- confidencialidade: diz respeito a postura que o profissional deve manter devido ao acesso que possui a dados sensíveis.
- integridade: realização do trabalho com honestidade e transparência, envitando conflitos de interesse e prezando por relações justas e imparciais.
- responsabilidade: se refere a prestação de contas quanto a proteção das informações e do sistema, sobre agir perante descoberta de riscos ou vulnerabilidades.

> A área de segurança e informação é responsável por garantir a ética para a proteção de dados.

As questões éticas na segurança da informação envolvem:

- uso ético de dados pessoais;
- a avaliação dos reguladores em relação à proteção de dados;
- confiança do cliente em relação à privacidade dos dados.

O **Hacker ético** é apresentado como praticante das atividades:

- identificação de vulnerabilidades ativas, relatando-as e impedindo que sejam exploradas.
  - avaliação de riscos (consequencias e seriedade de um ataque)
- testes de penetração (pen test), simulando ataques reais a um sistema.
  - testes de engenharia social
- auditorias de segurança: avaliar configurações, políticas e práticas de segurança.

Que por sua vez exigem as seguintes habilidades:

- conhecimentos em sistemas de segurança de computação e internet
- habilidades de alto nível de hacking
- capacidade de criar relatórios

O hacker ético pode trabalhar tanto com a segurança física, através da configuração de modens, switchs e outros aparelhos, assim como com a segurança virtual à nível de software e protocolos.

## Terceira aula: Profissões em cibersegurança

Essa aula apresenta os conceitos de **Red Team**, **Blue Team**, **Forense**, **GRC** e **DevSecOps**.

### Red Team

A **Red Team** é a equipe responsável pelo planejamento dos testes ofensivos dentro de uma empresa.

O seu objetivo principal é melhorar a segurança dos seus sistemas, e o seu trabalho pode ser dividido em 4 principais etapas:

1. Planejamento: definição de escopo, objetivo, regras e limites do teste, assim como levantamento de informações sobre o alvo - endereços IP, domínios, portas abertas, serviços ativos, etc.
2. Execução: o ataque em si é iniciado, usando métodos como phishing, brute force, SQL injection, XSS, engenharia social, além de documentar todo o andamento do teste.
3. Análise: geração do relatório sobre os objetivos definidos inicialmente, e se foram atingidos ou não.
4. Recomendação: descrição clara e objetiva das vulnerabilidades e evidências encontradas, impactos gerados e por fim as recomendações para solução.

### Blue Team

Do outro lado, a **Blue Team** foca em melhorar os sistemas e protocolos utilizados, através de detecção, monitoramento, resposta e neutralização de ataques.

A Blue Team tem como principais atividades:

- Monitoramento: acompanhamento dos sistemas para identificação de anomalias ou intrusões. Aqui entram as ferramentas como firewalls, antivirus, intrusion detection systems.
- Detecção: uso de técnicas como análise forense, engenharia reversa ou análise de malware, buscando evidências de ataques em andamentos ou que já tenham ocorrido.
- Resposta: através de uma postura reativa, são realizados isolamentos de rede, bloqueio de acesso, remoção de malwares e restauração de backups.
- Mitigação: através da análise dos resultados das respostas ao incidentes, são implementadas correções e atualizações.

### Forense

O profissional de cibersegurança **forense** é responsável por analisar os vestigios ("digitais" e "pegadas") deixadas por invasorem de sistemas de segurança ou base de dados, aplicando métodos para identificar fraudes, sabotagens e outros crimes digitais.

Esse profissional age como perito, precisando de conhecimentos da parte legislativa e judicial, além de técnicas de selagem física (proteger fisicamete os ativos de uma empresa), etiquetagem digital, criptografia, hashes e checksum.

As suas atividades incluem:

- Coleta: busca e apreensão de dados e dispositivos digitais relacionado aos incidentes.
- Seguir protocolos legais: respeitando a integridade dos dados e equipamentos.
- Preservação: deve proteger os dados de perdas acidentais ou intencionais, mantendo sua autenticidade.
- Análise: extração e interpretação das evidências.
- Apresentação: comunicação e divulgação dos resultados das análises.
- Elaboração de relatórios: descrevendo e justificando os métodos utilizados.

O desafio do profissional **forense** extrapola o conhecimento técnico, dialogando com diversas áreas e lidando com grande responsabilidade.

### GRC - governança, risco e conformidade

A área de GRC integra as diferentes equipes e estratégias de cibersegurança de uma empresa, delineando normas (ou requisitos regulatórios).

> A área de governança, risco e conformidade trabalha com métodos estruturados para alinhar a área de T.I e segurança da informação com as metas e objetivos traçados pela empresa, visando avaliar as áreas de risco.

Este profissional vai atuar diretamente com leis e padrões, implementando-as junto ao time de TI de uma empresa, em atividades como:

- Realização de auditorias internas.
- Desenvolvimento e implementação de planos de contingência e recuperação.
- Garantir a conformidade da empresa com a lei, protegendo-a contra sanções legais e regulatórias.

O profissional de GRC tem o conhecimento específico para a área de atuação da empresa: setor alimentício, setor contábil, farmaceutico, etc.

### DevSecOps

É a abreviação do termo "Development,Security and Operations". O profissional de **DevSecOps** involve o desenvolvimento, instalação e disponibilização de softwares de segurança, coordenando e executando atividades de segurança em conjunto com as áreas de desenvolvimento e segurança.

Suas principais atividades envolvem:

- Aplicar práticas de desenvolvimento ágil e contínuo.
- Implementar padrões de desenvolvimento como OWASP Top 10, SANS Tops 25, entre outros.
- Uso de ferramentas de análise estática ou dinâmica de código.

Seus principais desafios são a automatização dos processos de forma segura e em conformidade com os padrões existentes, protegendo os softwares contra ameaças cibernéticas ou falhas internas.

## Quarta aula: Conceitos iniciais

Essa aula foca em esclarecer conceitos e jargões comumente associados à cibersegurança, como **vírus**, **worms**, **trojans**, **SPAM**, **Spyware**, **Phishing**, **Botnets**, **Ransomware**, **Rootkit**, entre outros.

Um **vírus** é um software malicioso, com objetivo de causar danos, afetar o comportamento do computador ou roubar dados sigilosos.

Ele pode se espalhar através de diversos vetores, como anexos e e-mails falsos, downloads da internet ou dispositivos removíveis.

Existem diferentes tipos de vírus, alguns comuns sendo:

- Vírus de arquivo: presente em arquivos executáveis, é ativado quando o usuário executa o arquivo.
- Vírus de macro: explora macros em aplicativos como editores de texto ou planilhas.
- Vírus de boot: infecta o processo de inicialização do disco rígido.
- Vírus polimórficos: mudam o código cada vez que se replicam, dificultando sua detecção. Exemplo: Elk Cloner.
- Vírus residente: fica armazenado na memória do computador e infecta outros programas quando eles são executados. Exemplo: Angelina.Stoned.
- Worms: não precisam se anexar a arquivos e podem se espalhar automaticamente pela rede. Exemplo: [Conficker](https://pt.wikipedia.org/wiki/Conficker).

**Botnets** são redes de computadores infectados controlados remotamente, usados em ataques do tipo denial of service, onde muitas máquinas fazem requisições simultâneas a um mesmo site, que acaba ficando indisponível. Exemplo: [Mirai](<https://en.wikipedia.org/wiki/Mirai_(malware)>).

**Rootkit** são programas com acesso elevado que conseguem enviar informações para computadores de terceiros ou alterar configurações internas do computador. Exemplo: [Stuxnet](https://pt.wikipedia.org/wiki/Stuxnet).

**Trojans (cavalo de troia)** são programas maliciosos disfarçados como softwares legítimos, são executados pelo usuário e recebem acesso não autorizado ao sistema. Exemplo: [Zeus](<https://en.wikipedia.org/wiki/Zeus_(malware)>).

**Ransomware** são programas que criptografam os dados de uma máquina, e apenas liberam a chave para recuperação perante pagamento. Exemplo: [WannaCry](https://en.wikipedia.org/wiki/WannaCry_ransomware_attack).

## Quinta aula: Como se proteger

Essa aula trás algumas informações de conhecimento geral sobre proteção na web:

- Uso de senhas fortes: letras maiúsculas e minúsculas, números e símbolos, mínimo de oito caractéres.
- Atualizações: manter sistema operacional e aplicativos atualizados.
- Antivírus: ter um antivirus instalado e ativo na máquina.
- Autenticação de dois fatores: sempre habilitar nos serviços que disponibilizam.
- Não clicar em links ou anexos suspeitos.
- Evitar conexão em redes wifi abertas.
- Realizar backups periódicos.

Em um segundo momento, são abordados métodos para implementação das boas práticas, como:

- avaliar o nível de exposição às ameaças digitais.
- levantamento dos serviços utilizados.
- instalação e configuração das medidas de proteção.
- monitoramento e revisão das medidas implementadas periodicamente.

## Conclusão

Bom, como esperado, o módulo é inicial e introdutório. O conteúdo passado pelo professor é todo baseado num ebook, que fica disponível pra consulta após finalizar o módulo e é composto dos slides utilizados nas aulas.

Alguns termos e conceitos eu não conhecia direito, como DevSecOps e GRC, e a parte sobre vírus me deixou curioso pra pesquisa alguns dos casos famosos de cada tipo.

É um curso que pode ser recomendado sem medo praquele amigo que quer aprender sobre computadores.

Eu pretendo seguir apresentando os resumos das aulas enquanto eu seguir com o curso, então logo mais postarei sobre o segundo módulo, **Identificar componentes de hardware de computador**.

Abraço!
