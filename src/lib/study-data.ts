export interface DictionaryTerm {
  term: string;
  meaning: string;
  origin: string;
  whereItAppears: string;
  curiosities: string;
}

export interface CharacterProfile {
  name: string;
  birth: string;
  family: string;
  timeline: string[];
  mainVerses: string[];
  curiosities: string;
}

export interface ScholarCommentary {
  scholar: string;
  focus: string;
  summary: string;
}

export interface ArcheologyDiscovery {
  title: string;
  description: string;
  location: string;
  date: string;
}

export interface MapRoute {
  title: string;
  description: string;
  stops: string[];
}

export interface TimelinePeriod {
  period: string;
  dates: string;
  description: string;
  keyFigures: string[];
}

export interface StudyChallenge {
  id: string;
  title: string;
  description: string;
  category: "traducoes" | "exegese" | "contexto";
}

export const DICTIONARY: DictionaryTerm[] = [
  {
    term: "Graça",
    meaning:
      "Favor imerecido concedido por Deus ao ser humano. É a iniciativa divina que resgata o homem de sua condição de queda sem que este tenha feito algo para merecer.",
    origin:
      "Do hebraico 'Chen' (favor/benevolência) e do grego 'Charis' (dom gracioso, beleza ativa).",
    whereItAppears: "Efésios 2:8, Romanos 3:24, 2 Coríntios 12:9.",
    curiosities:
      "No mundo greco-romano antigo, 'charis' era usada para descrever o favor concedido por um patrono rico a um cliente subordinado que nunca poderia retribuir, criando uma aliança vitalícia.",
  },
  {
    term: "Pecado",
    meaning:
      "Afastamento voluntário da vontade divina, transgressão de leis espirituais ou rebelião contra Deus. No sentido literal, significa desviar-se do caminho ou da meta correta.",
    origin:
      "Do hebraico 'Chata'ah' (errar o alvo) e do grego 'Hamartia' (não atingir a marca desejada).",
    whereItAppears: "Romanos 3:23, 1 João 3:4, Gênesis 4:7.",
    curiosities:
      "A palavra 'hamartia' vinha da arquearia clássica grega: era usada quando um arqueiro atirava uma flecha e ela passava raspando ou caía longe do alvo.",
  },
  {
    term: "Messias",
    meaning:
      "O Salvador ungido prometido por Deus ao povo de Israel nas Escrituras do Antigo Testamento, que traria redenção e o Reino de Deus.",
    origin: "Do hebraico 'Mashiach' (ungido) e grego 'Christos' (cristo/ungido).",
    whereItAppears: "João 1:41, Daniel 9:25, Mateus 16:16.",
    curiosities:
      "No Antigo Testamento, profetas, sacerdotes e reis eram fisicamente ungidos com óleo perfumado especial como sinal de consagração e capacitação pelo Espírito de Deus.",
  },
  {
    term: "Justificação",
    meaning:
      "Ato judicial pelo qual Deus, com base na fé no sacrifício de Cristo, absolve o pecador de suas culpas e o declara formalmente justo e reconciliado perante a lei divina.",
    origin: "Do grego 'Dikaiosis' (ato de pronunciar alguém justo).",
    whereItAppears: "Romanos 5:1, Gálatas 2:16, Romanos 8:30.",
    curiosities:
      "Este termo tem raízes jurídicas nos tribunais romanos. Não significa fazer a pessoa perfeita, mas sim declará-la 'ficha limpa' em termos legais.",
  },
  {
    term: "Tabernáculo",
    meaning:
      "Tenda sagrada e móvel construída pelos israelitas sob a liderança de Moisés no deserto, servindo como a habitação provisória da glória e presença de Deus.",
    origin: "Do hebraico 'Mishkan' (morada) e do latim 'Tabernaculum' (tenda/cabana).",
    whereItAppears: "Êxodo 25:8, Hebreus 9:2-11, João 1:14.",
    curiosities:
      "Quando João diz em João 1:14 que o Verbo se fez carne e 'habitou' entre nós, a palavra grega original usada é 'eskenosen', que significa literalmente 'armou sua tenda/tabernáculo' entre nós.",
  },
];

export const CHARACTERS: CharacterProfile[] = [
  {
    name: "Moisés",
    birth: "Egito (Período de opressão faraônica)",
    family: "Joquebede (mãe), Anrão (pai), Arão (irmão), Miriã (irmã), Zípora (esposa).",
    timeline: [
      "Salvo das águas em um cesto de papiro no Rio Nilo.",
      "Criado na corte do Faraó como um príncipe do Egito.",
      "Fuga para o deserto de Midiã após defender um escravo hebreu.",
      "Chamado por Deus na Sarça Ardente para libertar o povo.",
      "Confrontou o Faraó nas 10 Pragas e liderou o Êxodo através do Mar Vermelho.",
      "Recebeu a Lei e as Tábuas dos 10 Mandamentos no Monte Sinai.",
      "Conduziu o povo de Israel pelo deserto durante 40 anos.",
    ],
    mainVerses: ["Êxodo 2 a 40", "Deuteronômio 34:10-12", "Hebreus 11:24-29"],
    curiosities:
      "Moisés foi o homem mais humilde da terra (Números 12:3) e o único a quem a Bíblia descreve falando com Deus face a face, como um amigo fala com outro.",
  },
  {
    name: "Pedro (Simão)",
    birth: "Betsaida, Galileia (Pescador)",
    family: "André (irmão), sogra de Pedro (citada nos Evangelhos).",
    timeline: [
      "Chamado por Jesus enquanto consertava redes no Mar da Galileia.",
      "Caminhou sobre a água ao encontro de Jesus.",
      "Fez a grande confissão de fé: 'Tu és o Cristo, o Filho do Deus vivo'.",
      "Negou a Jesus três vezes na noite da crucificação.",
      "Restaurado por Jesus na praia após a ressurreição.",
      "Pregou no Pentecostes, convertendo quase 3.000 pessoas no primeiro sermão.",
      "Liderou a pregação e foi martirizado em Roma por volta de 67 d.C.",
    ],
    mainVerses: ["Mateus 16:16-19", "João 21:15-19", "Atos 2:14-40", "1 e 2 Pedro"],
    curiosities:
      "Seu nome original era Simão (ou Shimon), mas Jesus deu-lhe o sobrenome de 'Cefas' (em aramaico) ou 'Petros' (em grego), que significa 'Rocha/Pedra'.",
  },
  {
    name: "João",
    birth: "Galileia (Pescador de Zebedeu)",
    family: "Tiago (irmão), Zebedeu (pai), Salomé (mãe).",
    timeline: [
      "Chamado com seu irmão Tiago, apelidados por Jesus de Boanerges ('Filhos do Trovão').",
      "Pertenceu ao círculo íntimo de Jesus (junto com Pedro e Tiago).",
      "Único discípulo presente ao pé da cruz, onde Jesus lhe confiou o cuidado de Maria.",
      "Primeiro apóstolo a crer na ressurreição ao ver o túmulo vazio.",
      "Escreveu o Evangelho de João e três cartas exortando ao amor fraternal.",
      "Exilado na Ilha de Patmos por pregar o evangelho.",
      "Recebeu a visão apocalíptica e escreveu o Livro do Apocalipse.",
    ],
    mainVerses: ["Marcos 3:17", "João 19:26-27", "1 João 4", "Apocalipse 1:9"],
    curiosities:
      "Diferente de todos os outros apóstolos que morreram martirizados, João foi o único que faleceu de velhice natural em Éfeso, sobrevivendo a tentativas de execução.",
  },
];

export const COMMENTARIES: Record<string, ScholarCommentary[]> = {
  "jo-3-16": [
    {
      scholar: "Matthew Henry (Puritano)",
      focus: "Teologia Devocional e Amor Soberano",
      summary:
        "O amor de Deus é a fonte de toda a redenção. O envio de Cristo não foi para comprar o amor de Deus, mas foi o fruto dele. O amor foi dado para todo o cosmos, mas o benefício é aplicado exclusivamente a quem crer, apontando a soberania e suficiência do sacrifício.",
    },
    {
      scholar: "F. F. Bruce (Historiador Bíblico)",
      focus: "Aspecto Exegético e Contexto do NT",
      summary:
        "A expressão 'Deus amou o mundo' era radical no pensamento judaico do primeiro século, que frequentemente via a salvação voltada a Israel e o julgamento ao resto do mundo. Bruce destaca que o amor divino abrange a totalidade humana de forma inclusiva através do Messias.",
    },
    {
      scholar: "Craig Keener (Historiador e Teólogo)",
      focus: "Contexto Cultural e Cultural do Primeiro Século",
      summary:
        "A palavra 'monogenēs' (traduzida por unigênito) evoca a história do sacrifício de Isaque no Antigo Testamento (Gênesis 22). No imaginário judaico antigo, o amor supremo é demonstrado por um pai disposto a entregar seu filho único e amado.",
    },
    {
      scholar: "N. T. Wright (Teólogo e Bispo Anglicano)",
      focus: "Redenção Cósmica e Escatologia",
      summary:
        "Salvação aqui não significa almas fugindo de um planeta ruim para um céu distante. Wright ressalta que 'não perecer, mas ter vida eterna' é sobre a restauração da criação — a vida da nova era trazida ao presente para redimir tanto o homem quanto o universo físico.",
    },
  ],
  "jo-1-1": [
    {
      scholar: "Matthew Henry (Puritano)",
      focus: "Divindade e Eternidade",
      summary:
        "O Verbo existia antes de todas as coisas criadas. Sua existência é eterna com o Pai, mantendo distinção de pessoas na Trindade, mas unidade absoluta em essência e divindade.",
    },
    {
      scholar: "Craig Keener (Historiador e Teólogo)",
      focus: "Origem do Logos Judaico/Helênico",
      summary:
        "João escreve usando o conceito de 'Logos' (Palavra). Para leitores gregos, isso alude à razão cósmica que ordena o universo. Para leitores judeus, aponta para a 'Memra' (a Palavra ativa de Deus pela qual Ele criou e se revelou no Antigo Testamento).",
    },
  ],
};

export const CROSS_REFERENCES: Record<string, string[]> = {
  "jo-3-16": ["Romanos 5:8", "Efésios 2:4-5", "1 João 4:9-10", "João 1:12"],
  "jo-1-1": ["Gênesis 1:1", "1 João 1:1-2", "Apocalipse 19:13", "Colossenses 1:16-17"],
  "gn-1-1": ["Salmos 102:25", "Isaías 40:21", "Hebreus 11:3", "João 1:3"],
  "sl-23-1": ["João 10:11", "Hebreus 13:20", "1 Pedro 2:25", "Apocalipse 7:17"],
};

export const ARCHEOLOGY: ArcheologyDiscovery[] = [
  {
    title: "Manuscritos do Mar Morto (Qumran)",
    description:
      "Descobertos em 1947 em cavernas perto do Mar Morto, contêm rolos de livros completos da Bíblia (como o Grande Rolo de Isaías) copiados mil anos antes do manuscrito mais antigo conhecido até então. Comprovou-se uma precisão impressionante na preservação dos textos bíblicos ao longo dos séculos.",
    location: "Qumran, Israel",
    date: "1947 - 1956",
  },
  {
    title: "Inscrição de Pilatos",
    description:
      "Uma placa de calcário gravada encontrada em Cesareia Marítima contendo o nome 'Poncio Pilatos, Prefeito da Judeia'. Foi a primeira evidência arqueológica contemporânea que confirma a existência histórica e o cargo oficial do governador romano que ordenou a crucificação de Jesus.",
    location: "Cesareia Marítima, Israel",
    date: "1961",
  },
  {
    title: "O Cilindro de Ciro",
    description:
      "Um artefato de argila contendo uma declaração do rei Ciro, o Grande, da Pérsia. O texto autoriza os povos exilados na Babilônia a regressarem para suas pátrias e a reconstruírem seus templos, o que valida historicamente o relato do Livro de Esdras 1 sobre o fim do exílio babilônico.",
    location: "Ruínas de Babilônia, Iraque",
    date: "1879",
  },
];

export const MAPS: MapRoute[] = [
  {
    title: "A Rota do Êxodo e Peregrinação no Deserto",
    description:
      "O caminho traçado pelo povo de Israel sob o comando de Moisés, saindo do cativeiro no Egito até as fronteiras da Terra Prometida.",
    stops: [
      "Ramessés (Ponto de partida no Egito)",
      "Mar Vermelho (Travessia miraculosa)",
      "Deserto de Sim (Provisão do Maná e Codornas)",
      "Monte Sinai (Aliança e entrega das Tábuas da Lei)",
      "Cades-Barneia (Rebelião dos espias e início dos 40 anos de peregrinação)",
      "Monte Nebo (Morte de Moisés com vista para Canaã)",
    ],
  },
  {
    title: "Viagens Missionárias do Apóstolo Paulo (Exemplo da 2ª Viagem)",
    description:
      "A rota em que Paulo expandiu a pregação cristã no continente europeu, fundando igrejas em cidades-chave do império.",
    stops: [
      "Antioquia da Síria (Início)",
      "Tarso (Visita a comunidades locais)",
      "Trôade (Visão do homem macedônio clamando por ajuda)",
      "Filipos (Primeira igreja fundada na Europa, prisão e libertação de Paulo)",
      "Atenas (Discurso no Areópago sobre o 'Deus Desconhecido')",
      "Corinto (Estadia de um ano e meio ensinando e fabricando tendas)",
      "Éfeso (Passagem rápida de retorno)",
    ],
  },
];

export const TIMELINE: TimelinePeriod[] = [
  {
    period: "1. Época dos Patriarcas",
    dates: "c. 2000 a.C. – 1600 a.C.",
    description:
      "Início da aliança de Deus com uma família específica para abençoar a Terra. Abrange a chamada de Abraão e o início do povo de Israel.",
    keyFigures: ["Abraão", "Sara", "Isaque", "Jacó", "José do Egito"],
  },
  {
    period: "2. Liderança de Moisés e Êxodo",
    dates: "c. 1446 a.C. ou 1290 a.C.",
    description:
      "A libertação do povo de Israel do cativeiro egípcio, a entrega da Lei Divina no deserto e a preparação para a conquista de Canaã.",
    keyFigures: ["Moisés", "Arão", "Josué", "Calebe"],
  },
  {
    period: "3. Período dos Juízes",
    dates: "c. 1380 a.C. – 1050 a.C.",
    description:
      "Ciclos de apostasia, opressão militar por nações vizinhas, arrependimento e libertação por líderes carismáticos (Juízes) enviados por Deus.",
    keyFigures: ["Gideão", "Sansão", "Débora", "Samuel"],
  },
  {
    period: "4. A Monarquia Unida e Dividida",
    dates: "1050 a.C. – 586 a.C.",
    description:
      "Era de ouro com reis como Davi e Salomão. Após Salomão, o reino se racha em dois: Reino do Norte (Israel) e Reino do Sul (Judá). Período dos grandes profetas clássicos.",
    keyFigures: ["Saul", "Davi", "Salomão", "Elias", "Isaías", "Jeremias"],
  },
  {
    period: "5. Exílio Babilônico e Retorno",
    dates: "586 a.C. – 400 a.C.",
    description:
      "Destruição de Jerusalém e exílio dos judeus na Babilônia. Anos mais tarde, com a ascensão persa, o povo retorna para reconstruir o Templo.",
    keyFigures: ["Daniel", "Ezequiel", "Esdras", "Neemias", "Zorobabel"],
  },
  {
    period: "6. Jesus e os Evangelhos",
    dates: "c. 4 a.C. – 30 d.C.",
    description:
      "Nascimento, ministério público, ensino das parábolas, morte expiatória na cruz e ressurreição corpórea de Jesus Cristo.",
    keyFigures: ["Jesus Cristo", "João Batista", "Os Doze Apóstolos", "Maria"],
  },
  {
    period: "7. Igreja Primitiva e Missões",
    dates: "c. 30 d.C. – 100 d.C.",
    description:
      "Descida do Espírito Santo no Pentecostes, nascimento da Igreja, expansão das missões aos gentios através do Apóstolo Paulo e escrita do Novo Testamento.",
    keyFigures: ["Pedro", "Estêvão", "Paulo de Tarso", "Barnabé", "João"],
  },
];

export const STUDY_CHALLENGES: StudyChallenge[] = [
  {
    id: "chall-1",
    title: "Quem foi Melquisedeque?",
    description:
      "Pesquise no dicionário ou leia em Gênesis 14:18 e Hebreus 7 para descobrir quem foi este rei e sacerdote misterioso.",
    category: "exegese",
  },
  {
    id: "chall-2",
    title: "Compare Quatro Traduções",
    description:
      "Utilize a ferramenta de comparação de traduções com o versículo João 3:16 ou João 1:1 e anote as principais variações de termos.",
    category: "traducoes",
  },
  {
    id: "chall-3",
    title: "Estude o Contexto Prévio e Posterior",
    description:
      "Abra o capítulo 1 de João. Leia a introdução histórica e anote qual era a situação cultural e política da região da Galileia.",
    category: "contexto",
  },
];

export function searchAll(query: string) {
  const q = query.toLowerCase().trim();
  if (!q)
    return {
      verses: [],
      characters: [],
      places: [],
      books: [],
      words: [],
      commentaries: [],
      maps: [],
      timeline: [],
    };

  // Search in Dictionary
  const words = DICTIONARY.filter(
    (d) => d.term.toLowerCase().includes(q) || d.meaning.toLowerCase().includes(q),
  );

  // Search in Characters
  const characters = CHARACTERS.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.timeline.some((t) => t.toLowerCase().includes(q)) ||
      c.curiosities.toLowerCase().includes(q),
  );

  // Search in Commentaries
  const commentariesList: { key: string; scholar: string; focus: string; summary: string }[] = [];
  Object.entries(COMMENTARIES).forEach(([key, list]) => {
    list.forEach((c) => {
      if (
        c.scholar.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q) ||
        c.focus.toLowerCase().includes(q)
      ) {
        commentariesList.push({ key, ...c });
      }
    });
  });

  // Search in Maps
  const mapsList = MAPS.filter(
    (m) =>
      m.title.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.stops.some((s) => s.toLowerCase().includes(q)),
  );

  // Search in Timeline
  const timelineList = TIMELINE.filter(
    (t) =>
      t.period.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.keyFigures.some((kf) => kf.toLowerCase().includes(q)),
  );

  // Search in Archaeology (Places / Discoveries)
  const places = ARCHEOLOGY.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.location.toLowerCase().includes(q),
  );

  // Simulating search in books (we can match BIBLE_BOOKS names)
  const books = [
    { name: "João", category: "Novo Testamento", abbr: "jo" },
    { name: "Gênesis", category: "Antigo Testamento", abbr: "gn" },
    { name: "Salmos", category: "Antigo Testamento", abbr: "sl" },
  ].filter((b) => b.name.toLowerCase().includes(q));

  // Simulating search in verses
  const verses: { ref: string; text: string }[] = [];
  const sampleVerses = [
    { ref: "João 3:16", text: "Porque Deus amou o mundo de tal maneira..." },
    { ref: "João 1:1", text: "No princípio era o Verbo, e o Verbo estava com Deus..." },
    { ref: "Gênesis 1:1", text: "No princípio Deus criou os céus e a terra..." },
    { ref: "Salmos 23:1", text: "O Senhor é o meu pastor; de nada terei falta..." },
  ];
  sampleVerses.forEach((v) => {
    if (v.ref.toLowerCase().includes(q) || v.text.toLowerCase().includes(q)) {
      verses.push(v);
    }
  });

  return {
    verses,
    characters,
    places,
    books,
    words,
    commentaries: commentariesList,
    maps: mapsList,
    timeline: timelineList,
  };
}
