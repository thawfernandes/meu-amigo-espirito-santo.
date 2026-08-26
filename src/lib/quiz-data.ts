export type QuestionType =
  | "multiple-choice"
  | "fill-blank"
  | "matching"
  | "chronological"
  | "true-false"
  | "context";

export interface BibleQuestion {
  id: string;
  type: QuestionType;
  book?: string;
  chapter?: number;
  difficulty: "beginner" | "walking" | "deepening";
  question: string;
  options?: string[]; // Para múltipla escolha e verdadeiro/falso
  correctAnswer: string; // Para múltipla escolha, verdadeiro/falso e lacunas
  matchingLeft?: string[]; // Para relacionar
  matchingRight?: string[]; // Para relacionar (na ordem correta correspondente ao Left)
  chronologicalItems?: string[]; // Itens a serem ordenados cronologicamente (da esquerda/primeiro para direita/último)
  explanation: string;
  suggestedReading: string;
}

export const COMPLETED_BOOKS = ["rt", "fp", "tg", "1jo", "2jo", "3jo", "fm", "jd"];

export function isBookStudyCompleted(bookAbbr: string): boolean {
  return COMPLETED_BOOKS.includes(bookAbbr.toLowerCase().trim());
}

export const BIBLE_QUESTIONS: BibleQuestion[] = [
  // ── Gênesis 1 (Mantido como legado, mas livro em desenvolvimento) ────────────────
  {
    id: "gn-1-q1",
    type: "multiple-choice",
    book: "Gênesis",
    chapter: 1,
    difficulty: "beginner",
    question: "O que Deus criou no princípio, de acordo com Gênesis 1:1?",
    options: [
      "O homem e a mulher",
      "Os céus e a terra",
      "O sol, a lua e as estrelas",
      "Os animais marinhos",
    ],
    correctAnswer: "Os céus e a terra",
    explanation:
      "Gênesis 1:1 afirma textualmente: 'No princípio Deus criou os céus e a terra', estabelecendo Deus como o Criador Soberano de todo o universo.",
    suggestedReading: "Gênesis 1",
  },
  {
    id: "gn-1-q2",
    type: "true-false",
    book: "Gênesis",
    chapter: 1,
    difficulty: "beginner",
    question:
      "A terra já estava totalmente organizada e cheia de seres vivos no princípio, antes de Deus dizer 'Haja luz'. Verdadeiro ou Falso?",
    options: ["Verdadeiro", "Falso"],
    correctAnswer: "Falso",
    explanation:
      "A Bíblia diz em Gênesis 1:2 que 'a terra era sem forma e vazia' e 'trevas cobriam a face do abismo' antes da ação de Deus.",
    suggestedReading: "Gênesis 1",
  },
  {
    id: "gn-1-q3",
    type: "multiple-choice",
    book: "Gênesis",
    chapter: 1,
    difficulty: "walking",
    question: "O que Deus criou no primeiro dia da criação ao ordenar com a Sua palavra?",
    options: [
      "As plantas e árvores",
      "O sol e a lua",
      "A luz e a separação das trevas",
      "O firmamento",
    ],
    correctAnswer: "A luz e a separação das trevas",
    explanation:
      "Deus disse: 'Haja luz', e fez separação entre a luz e as trevas, chamando à luz Dia e às trevas Noite (Gênesis 1:3-5).",
    suggestedReading: "Gênesis 1",
  },

  // ── Salmos 23 (Mantido como legado, mas livro em desenvolvimento) ───────────────
  {
    id: "sl-23-q1",
    type: "fill-blank",
    book: "Salmos",
    chapter: 23,
    difficulty: "beginner",
    question:
      "Complete o versículo do Salmo 23:1: 'O Senhor é o meu ________, de nada terei falta.'",
    correctAnswer: "pastor",
    explanation:
      "O Salmo 23, escrito por Davi, utiliza a metáfora do pastor de ovelhas para demonstrar o cuidado protetor, guia e provisão diária que Deus oferece aos Seus filhos.",
    suggestedReading: "Salmos 23",
  },
  {
    id: "sl-23-q2",
    type: "multiple-choice",
    book: "Salmos",
    chapter: 23,
    difficulty: "walking",
    question: "Segundo o Salmo 23, para onde o bom pastor conduz as suas ovelhas para descansar?",
    options: [
      "Para o alto de montanhas áridas",
      "A águas tranquilas e pastagens verdes",
      "Para o meio de espinhos protetores",
      "Para a entrada de cavernas escuras",
    ],
    correctAnswer: "A águas tranquilas e pastagens verdes",
    explanation:
      "O versículo 2 descreve: 'Em verdes pastagens me faz repousar e me conduz a águas tranquilas', indicando descanso físico e paz espiritual que Deus concede.",
    suggestedReading: "Salmos 23",
  },

  // ── João 1 (Mantido como legado, mas livro em desenvolvimento) ─────────────────
  {
    id: "jo-1-q1",
    type: "multiple-choice",
    book: "João",
    chapter: 1,
    difficulty: "beginner",
    question:
      "No prólogo do Evangelho de João (João 1:1), quem é identificado como estando com Deus no princípio e sendo Deus?",
    options: ["João Batista", "Moisés", "O Verbo (ou a Palavra)", "O Anjo Gabriel"],
    correctAnswer: "O Verbo (ou a Palavra)",
    explanation:
      "João 1:1 declara: 'No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus', uma afirmação fundamental da eternidade e divindade de Jesus Cristo.",
    suggestedReading: "João 1",
  },
  {
    id: "jo-1-q2",
    type: "context",
    book: "João",
    chapter: 1,
    difficulty: "deepening",
    question:
      "Qual o significado histórico e teológico do termo grego 'Logos' (traduzido como Verbo/Palavra) no primeiro capítulo de João?",
    options: [
      "Era um termo puramente militar romano para designar ordens do imperador.",
      "Para os gregos representava a razão cósmica que sustenta o universo, e para os judeus evocava a Palavra ativa de Deus na criação (Memra). João conecta ambos para apresentar Jesus como a revelação suprema.",
      "Significa simplesmente 'uma conversa comum' entre os apóstolos e Jesus.",
      "Era o nome de uma seita herética que João estava tentando converter em Éfeso.",
    ],
    correctAnswer:
      "Para os gregos representava a razão cósmica que sustenta o universo, e para os judeus evocava a Palavra ativa de Deus na criação (Memra). João conecta ambos para apresentar Jesus como a revelação suprema.",
    explanation:
      "Ao usar 'Logos', João comunica tanto com a filosofia grega quanto com a tradição do Antigo Testamento, mostrando que Jesus é tanto a mente que ordena o cosmos quanto a própria Palavra viva e criadora do Deus de Israel.",
    suggestedReading: "João 1",
  },
  {
    id: "jo-1-q3",
    type: "multiple-choice",
    book: "João",
    chapter: 1,
    difficulty: "walking",
    question: "De acordo com João 1:14, o que aconteceu com o Verbo?",
    options: [
      "Ele permaneceu invisível no céu",
      "Ele se fez carne e habitou entre nós",
      "Ele transformou-se em um livro escrito",
      "Ele apareceu apenas como um espírito de luz",
    ],
    correctAnswer: "Ele se fez carne e habitou entre nós",
    explanation:
      "João 1:14 expressa o milagre da Encarnação: 'E o Verbo se fez carne e habitou entre nós, e vimos a sua glória, glória como do unigênito do Pai, cheio de graça e de verdade.'",
    suggestedReading: "João 1",
  },

  // ══════════════════════════════════════════════════════════════════════
  // RUTE (LIVRO COMPLETO - CAPÍTULOS 1 A 4)
  // ══════════════════════════════════════════════════════════════════════

  // ── Rute 1 ──────────────────────────────────────────────────────────
  {
    id: "rt-1-q1",
    type: "multiple-choice",
    book: "Rute",
    chapter: 1,
    difficulty: "beginner",
    question: "Por que Elimeleque, sua esposa Noemi e seus dois filhos se mudaram de Belém de Judá para a terra de Moabe?",
    options: [
      "Por causa de uma grande fome que assolava a terra de Judá",
      "Porque foram exilados por ordem do rei de Israel",
      "Para fugirem de uma invasão militar dos filisteus",
      "Para estabelecerem um novo comércio de gado em Moabe"
    ],
    correctAnswer: "Por causa de uma grande fome que assolava a terra de Judá",
    explanation: "Rute 1:1 explica que houve uma grave fome na terra de Israel, o que motivou a mudança da família para os campos de Moabe em busca de sustento.",
    suggestedReading: "Rute 1:1-2"
  },
  {
    id: "rt-1-q2",
    type: "multiple-choice",
    book: "Rute",
    chapter: 1,
    difficulty: "walking",
    question: "Qual famosa declaração de lealdade Rute faz a Noemi ao recusar-se a voltar para a sua terra natal?",
    options: [
      "O teu povo será o meu povo, e o teu Deus o meu Deus",
      "Eu te servirei todos os dias e te darei o sustento dos meus campos",
      "Aonde fores, eu não poderei ir, mas orarei por ti todos os dias",
      "Que o Senhor me abençoe com um novo marido em Moabe"
    ],
    correctAnswer: "O teu povo será o meu povo, e o teu Deus o meu Deus",
    explanation: "Rute 1:16 registra essa belíssima expressão de fidelidade e conversão espiritual de Rute ao Deus de Israel e ao povo de Noemi.",
    suggestedReading: "Rute 1:16-17"
  },
  {
    id: "rt-1-q3",
    type: "multiple-choice",
    book: "Rute",
    chapter: 1,
    difficulty: "deepening",
    question: "Ao retornar a Belém com Rute, sob qual nome Noemi pediu para ser chamada e por qual motivo?",
    options: [
      "Mara, porque ela sentia que o Todo-Poderoso a havia enchido de amargura",
      "Orfa, em homenagem à sua nora que ficara em Moabe",
      "Debora, que significa abelha trabalhadora",
      "Sara, pois ela cria que Deus lhe daria uma nova descendência"
    ],
    correctAnswer: "Mara, porque ela sentia que o Todo-Poderoso a havia enchido de amargura",
    explanation: "Noemi significa 'agradável', mas ela pede para ser chamada de 'Mara' (que significa amarga) devido às grandes perdas de seu marido e filhos (Rute 1:20-21).",
    suggestedReading: "Rute 1:20-21"
  },

  // ── Rute 2 ──────────────────────────────────────────────────────────
  {
    id: "rt-2-q1",
    type: "multiple-choice",
    book: "Rute",
    chapter: 2,
    difficulty: "beginner",
    question: "De quem era o campo onde Rute foi respigar espigas ao chegar em Belém de Judá?",
    options: [
      "Boaz, um parente influente e rico da família de Elimeleque",
      "Um fazendeiro moabita que morava em Israel",
      "Do próprio rei que governava Belém",
      "De um levita que cedeu a terra por caridade"
    ],
    correctAnswer: "Boaz, um parente influente e rico da família de Elimeleque",
    explanation: "Rute 2:1-3 mostra que, por providência divina, Rute foi respigar justamente no campo de Boaz, que era parente do falecido marido de Noemi.",
    suggestedReading: "Rute 2:1-3"
  },
  {
    id: "rt-2-q2",
    type: "multiple-choice",
    book: "Rute",
    chapter: 2,
    difficulty: "walking",
    question: "Que instruções de segurança e proteção Boaz dá a Rute quando a encontra trabalhando?",
    options: [
      "Para não ir a outro campo e permanecer junto das suas servas",
      "Para voltar para Moabe pois o campo era perigoso",
      "Para trabalhar apenas durante a noite longe dos homens",
      "Para pagar uma taxa de colheita aos seus capatazes"
    ],
    correctAnswer: "Para não ir a outro campo e permanecer junto das suas servas",
    explanation: "Boaz demonstra bondade e cuidado protetor instruindo Rute a colher apenas em suas terras e a ficar perto de suas servas para evitar assédios (Rute 2:8-9).",
    suggestedReading: "Rute 2:8-9"
  },
  {
    id: "rt-2-q3",
    type: "multiple-choice",
    book: "Rute",
    chapter: 2,
    difficulty: "deepening",
    question: "Como Boaz demonstrou generosidade extra a Rute, além de permitir que ela colhesse normalmente?",
    options: [
      "Ordenou aos segadores que deixassem cair punhados de espigas de propósito para ela",
      "Deu-lhe uma parte de sua própria herança de terras imediatamente",
      "Pediu que ela governasse os demais trabalhadores do campo",
      "Isentou-a de qualquer trabalho físico, dando-lhe fardos prontos"
    ],
    correctAnswer: "Ordenou aos segadores que deixassem cair punhados de espigas de propósito para ela",
    explanation: "Boaz instruiu secretamente seus trabalhadores a facilitarem o trabalho de Rute, deixando cair espigas de propósito para que ela colhesse em abundância (Rute 2:15-16).",
    suggestedReading: "Rute 2:15-16"
  },

  // ── Rute 3 ──────────────────────────────────────────────────────────
  {
    id: "rt-3-q1",
    type: "multiple-choice",
    book: "Rute",
    chapter: 3,
    difficulty: "beginner",
    question: "O que Noemi orientou Rute a fazer na eira de Boaz durante a noite?",
    options: [
      "Banhar-se, ungir-se, vestir sua melhor roupa e deitar-se aos pés dele após ele dormir",
      "Exigir em voz alta o resgate das terras de sua família na frente de todos",
      "Esconder-se no celeiro e recolher o trigo secretamente de madrugada",
      "Pedir que Boaz lhe desse um emprego fixo em sua casa"
    ],
    correctAnswer: "Banhar-se, ungir-se, vestir sua melhor roupa e deitar-se aos pés dele após ele dormir",
    explanation: "Noemi instruiu Rute a seguir um costume cultural e de respeito da época para apresentar formalmente o pedido de resgate familiar a Boaz (Rute 3:3-4).",
    suggestedReading: "Rute 3:3-4"
  },
  {
    id: "rt-3-q2",
    type: "multiple-choice",
    book: "Rute",
    chapter: 3,
    difficulty: "walking",
    question: "Que pedido simbólico e de profundo significado cultural Rute faz a Boaz quando ele acorda à meia-noite?",
    options: [
      "Que estenda a sua capa sobre ela, pois ele é o resgatador de sua família",
      "Que lhe empreste dinheiro para comprar sementes",
      "Que adote Noemi como sua própria mãe",
      "Que lhe dê o sapato dele como prova de aliança"
    ],
    correctAnswer: "Que estenda a sua capa sobre ela, pois ele é o resgatador de sua família",
    explanation: "Estender a capa era uma metáfora cultural para pedir proteção, casamento e resgate (Goel) de acordo com a Lei de Moisés (Rute 3:9).",
    suggestedReading: "Rute 3:9"
  },
  {
    id: "rt-3-q3",
    type: "multiple-choice",
    book: "Rute",
    chapter: 3,
    difficulty: "deepening",
    question: "Por que Boaz não pôde aceitar e realizar o resgate de Rute imediatamente naquela mesma noite?",
    options: [
      "Porque havia um outro parente resgatador mais próximo do que ele",
      "Porque a lei de Israel proibia o casamento com moabitas em qualquer circunstância",
      "Porque ele não tinha recursos financeiros suficientes no momento",
      "Porque Noemi precisava dar o seu consentimento por escrito primeiro"
    ],
    correctAnswer: "Porque havia um outro parente resgatador mais próximo do que ele",
    explanation: "Boaz honrou a lei e explicou que havia um parente mais próximo com direito de preferência no resgate, o qual precisava ser consultado primeiro (Rute 3:12-13).",
    suggestedReading: "Rute 3:12-13"
  },

  // ── Rute 4 ──────────────────────────────────────────────────────────
  {
    id: "rt-4-q1",
    type: "multiple-choice",
    book: "Rute",
    chapter: 4,
    difficulty: "beginner",
    question: "Onde Boaz se reuniu com o outro parente resgatador para definir quem resgataria as terras de Elimeleque e se casaria com Rute?",
    options: [
      "À porta da cidade, na presença de dez testemunhas anciãs da cidade",
      "No templo sagrado de Jerusalém diante do sumo sacerdote",
      "No meio de seu campo de trigo durante a colheita",
      "Na casa de Noemi em uma reunião familiar privada"
    ],
    correctAnswer: "À porta da cidade, na presença de dez testemunhas anciãs da cidade",
    explanation: "A porta da cidade era o local público oficial para transações jurídicas e decisões comunitárias no antigo Israel (Rute 4:1-2).",
    suggestedReading: "Rute 4:1-2"
  },
  {
    id: "rt-4-q2",
    type: "multiple-choice",
    book: "Rute",
    chapter: 4,
    difficulty: "walking",
    question: "Qual era o costume em Israel para confirmar um negócio de resgate ou troca de propriedade, realizado pelo parente ao ceder o direito a Boaz?",
    options: [
      "Tirar o próprio calçado e entregá-lo ao comprador",
      "Quebrar um vaso de barro diante das testemunhas",
      "Derramar óleo perfumado sobre a terra resgatada",
      "Apertar as mãos e assinar um pergaminho de papiro"
    ],
    correctAnswer: "Tirar o próprio calçado e entregá-lo ao comprador",
    explanation: "O versículo 7 relata que tirar o sapato e entregá-lo ao outro era o sinal público de renúncia de direito e transferência de propriedade em Israel (Rute 4:7-8).",
    suggestedReading: "Rute 4:7-8"
  },
  {
    id: "rt-4-q3",
    type: "multiple-choice",
    book: "Rute",
    chapter: 4,
    difficulty: "deepening",
    question: "Quem foi o filho gerado por Boaz e Rute, e qual a sua importância na genealogia bíblica?",
    options: [
      "Obede, que foi o pai de Jessé e avô do rei Davi",
      "Salomão, o homem mais sábio de Israel",
      "Fares, o ancestral da tribo de Judá",
      "Samuel, o grande profeta e juiz de Israel"
    ],
    correctAnswer: "Obede, que foi o pai de Jessé e avô do rei Davi",
    explanation: "O nascimento de Obede insere Rute, a moabita, diretamente na linhagem real do Rei Davi e, consequentemente, na genealogia de Jesus Cristo (Rute 4:17-22).",
    suggestedReading: "Rute 4:17-22"
  },

  // ══════════════════════════════════════════════════════════════════════
  // FILIPENSES (LIVRO COMPLETO - CAPÍTULOS 1 A 4)
  // ══════════════════════════════════════════════════════════════════════

  // ── Filipenses 1 ────────────────────────────────────────────────────
  {
    id: "fp-1-q1",
    type: "multiple-choice",
    book: "Filipenses",
    chapter: 1,
    difficulty: "beginner",
    question: "Qual era a condição física e social de Paulo ao escrever a carta à igreja em Filipos?",
    options: [
      "Ele estava preso sob custódia militar romana",
      "Ele estava viajando de navio rumo à Espanha",
      "Ele estava pastoreando a igreja de Éfeso em plena liberdade",
      "Ele estava escondido em uma caverna na Judeia"
    ],
    correctAnswer: "Ele estava preso sob custódia militar romana",
    explanation: "Paulo escreve Filipenses de uma prisão (provavelmente em Roma), referindo-se repetidamente às suas 'cadeias' e à guarda pretoriana (Filipenses 1:13).",
    suggestedReading: "Filipenses 1:12-14"
  },
  {
    id: "fp-1-q2",
    type: "multiple-choice",
    book: "Filipenses",
    chapter: 1,
    difficulty: "walking",
    question: "Como Paulo descreve o impacto de suas prisões no progresso do Evangelho?",
    options: [
      "Tornaram o Evangelho mais conhecido e deram coragem a outros irmãos para pregar",
      "Desanimaram completamente os discípulos em toda a Ásia",
      "Fizeram com que ele desistisse de pregar aos gentios",
      "Forçaram a igreja a fechar suas portas por medo das autoridades"
    ],
    correctAnswer: "Tornaram o Evangelho mais conhecido e deram coragem a outros irmãos para pregar",
    explanation: "Paulo afirma em Filipenses 1:12-14 que suas cadeias contribuíram para o progresso do evangelho, encorajando a maioria dos irmãos a falar a palavra sem temor.",
    suggestedReading: "Filipenses 1:12-14"
  },
  {
    id: "fp-1-q3",
    type: "multiple-choice",
    book: "Filipenses",
    chapter: 1,
    difficulty: "deepening",
    question: "Complete a célebre declaração de determinação espiritual de Paulo em Filipenses 1:21: 'Porque para mim o viver é Cristo, e o morrer é ______'.",
    options: [
      "ganho",
      "perda",
      "sono",
      "tristeza"
    ],
    correctAnswer: "ganho",
    explanation: "Para Paulo, a morte física não era uma tragédia, mas sim a união plena com Cristo, superando os sofrimentos terrestres (Filipenses 1:21-23).",
    suggestedReading: "Filipenses 1:21-23"
  },

  // ── Filipenses 2 ────────────────────────────────────────────────────
  {
    id: "fp-2-q1",
    type: "multiple-choice",
    book: "Filipenses",
    chapter: 2,
    difficulty: "beginner",
    question: "Qual exemplo supremo de humildade e esvaziamento Paulo exorta os Filipenses a imitarem?",
    options: [
      "O exemplo de Jesus Cristo, que se esvaziou a si mesmo e foi obediente até a morte de cruz",
      "O estilo de vida simples de João Batista no deserto",
      "A generosidade dos anciãos da igreja de Jerusalém",
      "A paciência de Moisés ao guiar o povo rebelde"
    ],
    correctAnswer: "O exemplo de Jesus Cristo, que se esvaziou a si mesmo e foi obediente até a morte de cruz",
    explanation: "O famoso hino da Kenosis (Filipenses 2:5-11) apresenta Jesus como o modelo perfeito de quem abre mão de seus direitos divinos em favor dos outros.",
    suggestedReading: "Filipenses 2:5-8"
  },
  {
    id: "fp-2-q2",
    type: "multiple-choice",
    book: "Filipenses",
    chapter: 2,
    difficulty: "walking",
    question: "De acordo com Filipenses 2:12, como os cristãos devem desenvolver (ou operar) a sua própria salvação?",
    options: [
      "Com temor e tremor, sabendo que Deus opera o querer e o realizar",
      "Por meio de penitências físicas rigorosas e jejuns constantes",
      "Apenas aguardando de forma totalmente passiva",
      "Debatendo teologia filosófica nos tribunais da cidade"
    ],
    correctAnswer: "Com temor e tremor, sabendo que Deus opera o querer e o realizar",
    explanation: "Paulo ensina uma sinergia prática: devemos nos empenhar com reverência profunda (temor e tremor) porque Deus mesmo capacita nossa vontade e ação (Filipenses 2:12-13).",
    suggestedReading: "Filipenses 2:12-13"
  },
  {
    id: "fp-2-q3",
    type: "multiple-choice",
    book: "Filipenses",
    chapter: 2,
    difficulty: "deepening",
    question: "Quem foi o colaborador filipense que ficou gravemente doente ao trazer provisões a Paulo na prisão, e a quem Paulo elogia calorosamente?",
    options: [
      "Epafrodito",
      "Timóteo",
      "Silas",
      "Filemom"
    ],
    correctAnswer: "Epafrodito",
    explanation: "Epafrodito arriscou a vida para servir a Paulo em nome da igreja de Filipos, adoecendo a ponto de quase morrer, mas Deus teve misericórdia dele (Filipenses 2:25-30).",
    suggestedReading: "Filipenses 2:25-30"
  },

  // ── Filipenses 3 ────────────────────────────────────────────────────
  {
    id: "fp-3-q1",
    type: "multiple-choice",
    book: "Filipenses",
    chapter: 3,
    difficulty: "beginner",
    question: "Como Paulo considera suas credenciais religiosas e vantagens de nascimento judaicas em relação ao conhecimento de Cristo?",
    options: [
      "Como refugo (lixo/perda) para poder ganhar a Cristo",
      "Como essenciais para ser salvo e aceito por Deus",
      "Como motivo de orgulho e superioridade sobre os gentios",
      "Como requisitos obrigatórios para exercer o apostolado"
    ],
    correctAnswer: "Como refugo (lixo/perda) para poder ganhar a Cristo",
    explanation: "Paulo usa o termo grego 'skubala' (lixo/esterco/refugo) para enfatizar que nada se compara à sublimidade do conhecimento de Jesus (Filipenses 3:7-8).",
    suggestedReading: "Filipenses 3:7-8"
  },
  {
    id: "fp-3-q2",
    type: "multiple-choice",
    book: "Filipenses",
    chapter: 3,
    difficulty: "walking",
    question: "Que imagem prática de atletismo Paulo usa para ilustrar sua dedicação na caminhada cristã?",
    options: [
      "Correr em direção ao alvo, esquecendo as coisas passadas e avançando para as do futuro",
      "Lutar boxe sem golpear o ar de forma inútil",
      "Remar contra a correnteza em um lago tempestuoso",
      "Levantar pesos pesados para fortalecer a fé"
    ],
    correctAnswer: "Correr em direção ao alvo, esquecendo as coisas passadas e avançando para as do futuro",
    explanation: "Paulo descreve o foco do corredor espiritual que não olha para trás, mas estica-se para frente buscando o prêmio da soberana vocação (Filipenses 3:13-14).",
    suggestedReading: "Filipenses 3:13-14"
  },
  {
    id: "fp-3-q3",
    type: "multiple-choice",
    book: "Filipenses",
    chapter: 3,
    difficulty: "deepening",
    question: "Segundo Filipenses 3:20, onde está localizada a verdadeira cidadania (pátria) dos cristãos?",
    options: [
      "Nos céus, de onde também aguardam o Salvador",
      "Em Roma, devido ao status jurídico dos filipenses",
      "Em Jerusalém, a capital espiritual da terra",
      "Em qualquer lugar onde o imperador romano não governe"
    ],
    correctAnswer: "Nos céus, de onde também aguardam o Salvador",
    explanation: "Filipos era uma colônia romana cujos habitantes se orgulhavam da cidadania de Roma. Paulo confronta essa mentalidade lembrando que a pátria definitiva do cristão está nos céus (Filipenses 3:20).",
    suggestedReading: "Filipenses 3:20-21"
  },

  // ── Filipenses 4 ────────────────────────────────────────────────────
  {
    id: "fp-4-q1",
    type: "multiple-choice",
    book: "Filipenses",
    chapter: 4,
    difficulty: "beginner",
    question: "Quais são as duas mulheres filipenses que Paulo exorta nominalmente a resolverem seus conflitos e viverem em harmonia no Senhor?",
    options: [
      "Evódia e Síntique",
      "Lídia e Priscila",
      "Febe e Maria",
      "Lois e Eunice"
    ],
    correctAnswer: "Evódia e Síntique",
    explanation: "No início de Filipenses 4, Paulo pede diretamente que Evódia e Síntique evitem discórdias na comunidade e busquem o mesmo sentimento no Senhor (Filipenses 4:2).",
    suggestedReading: "Filipenses 4:2-3"
  },
  {
    id: "fp-4-q2",
    type: "multiple-choice",
    book: "Filipenses",
    chapter: 4,
    difficulty: "walking",
    question: "Segundo Filipenses 4:6-7, o que acontecerá quando os cristãos substituírem a ansiedade por orações de gratidão a Deus?",
    options: [
      "A paz de Deus, que excede todo o entendimento, guardará seus corações e mentes",
      "Eles receberão respostas instantâneas e riqueza imediata",
      "Eles serão libertados de todas as aflições físicas na terra",
      "Todos os seus inimigos serão convertidos imediatamente"
    ],
    correctAnswer: "A paz de Deus, que excede todo o entendimento, guardará seus corações e mentes",
    explanation: "A paz divina atua como uma sentinela armada (guardará) protegendo o mundo interior do crente contra a preocupação desmedida (Filipenses 4:6-7).",
    suggestedReading: "Filipenses 4:6-7"
  },
  {
    id: "fp-4-q3",
    type: "multiple-choice",
    book: "Filipenses",
    chapter: 4,
    difficulty: "deepening",
    question: "Qual é o verdadeiro contexto da famosa afirmação de Paulo 'Tudo posso naquele que me fortalece' em Filipenses 4:13?",
    options: [
      "O aprendizado de estar contente tanto na escassez quanto na abundância",
      "A capacidade sobrenatural de curar doenças e realizar milagres físicos",
      "A garantia de vitória militar contra os perseguidores romanos",
      "A certeza de sucesso financeiro e prosperidade material irrestrita"
    ],
    correctAnswer: "O aprendizado de estar contente tanto na escassez quanto na abundância",
    explanation: "Nos versículos 11 e 12, Paulo explica que aprendeu o segredo de viver contente em qualquer situação (humilhado, farto, com fome ou fartura). O 'Tudo posso' refere-se a suportar qualquer circunstância fortalecido por Cristo (Filipenses 4:11-13).",
    suggestedReading: "Filipenses 4:11-13"
  },

  // ══════════════════════════════════════════════════════════════════════
  // TIAGO (LIVRO COMPLETO - CAPÍTULOS 1 A 5)
  // ══════════════════════════════════════════════════════════════════════

  // ── Tiago 1 ─────────────────────────────────────────────────────────
  {
    id: "tg-1-q1",
    type: "multiple-choice",
    book: "Tiago",
    chapter: 1,
    difficulty: "beginner",
    question: "Segundo Tiago 1:2-4, por que o cristão deve considerar motivo de alegria passar por provações?",
    options: [
      "Porque a provação da fé produz a paciência (perseverança)",
      "Porque prova que ele é superior aos pecadores do mundo",
      "Porque as provações duram apenas alguns minutos",
      "Porque Deus pune os justos antes de abençoá-los"
    ],
    correctAnswer: "Porque a provação da fé produz a paciência (perseverança)",
    explanation: "Tiago ensina que as dificuldades têm um propósito pedagógico na vida cristã: forjar um caráter maduro e perseverante (Tiago 1:2-4).",
    suggestedReading: "Tiago 1:2-4"
  },
  {
    id: "tg-1-q2",
    type: "multiple-choice",
    book: "Tiago",
    chapter: 1,
    difficulty: "walking",
    question: "A quem Tiago compara a pessoa que ouve a Palavra de Deus mas não a coloca em prática?",
    options: [
      "A um homem que observa seu rosto num espelho e, logo após sair, esquece como era",
      "A um navio sem leme perdido no meio de uma grande tempestade",
      "A uma casa edificada sobre a areia que desmorona com a chuva",
      "A uma árvore seca que não produz nenhuma folha verde"
    ],
    correctAnswer: "A um homem que observa seu rosto num espelho e, logo após sair, esquece como era",
    explanation: "A Palavra de Deus revela nossa real condição moral; ignorá-la na prática é esquecer o reflexo espiritual que ela nos mostra (Tiago 1:23-24).",
    suggestedReading: "Tiago 1:22-25"
  },
  {
    id: "tg-1-q3",
    type: "multiple-choice",
    book: "Tiago",
    chapter: 1,
    difficulty: "deepening",
    question: "Como Tiago define a religião pura e imaculada diante de Deus Pai?",
    options: [
      "Visitar órfãos e viúvas em suas tribulações e guardar-se incontaminado do mundo",
      "Cumprir todos os sacrifícios e rituais da lei mosaica no Templo",
      "Contribuir financeiramente com todas as sinagogas da Judeia",
      "Aprender de cor as Escrituras e discuti-las nas praças públicas"
    ],
    correctAnswer: "Visitar órfãos e viúvas em suas tribulações e guardar-se incontaminado do mundo",
    explanation: "Para Tiago, a verdadeira espiritualidade é ativa na caridade aos mais vulneráveis (órfãos/viúvas) e santa na conduta moral (Tiago 1:27).",
    suggestedReading: "Tiago 1:26-27"
  },

  // ── Tiago 2 ─────────────────────────────────────────────────────────
  {
    id: "tg-2-q1",
    type: "multiple-choice",
    book: "Tiago",
    chapter: 2,
    difficulty: "beginner",
    question: "Qual pecado social Tiago condena severamente ao exemplificar o tratamento diferenciado dado a um rico e a um pobre que entram na reunião?",
    options: [
      "Acepção de pessoas (parcialidade e preconceito social)",
      "O roubo de dízimos e ofertas",
      "A falta de vestimentas adequadas para o culto",
      "A preguiça no trabalho diário"
    ],
    correctAnswer: "Acepção de pessoas (parcialidade e preconceito social)",
    explanation: "Tiago ensina que favorecer os ricos e desprezar os necessitados viola a lei real do amor ao próximo e contradiz o caráter de Deus (Tiago 2:1-4).",
    suggestedReading: "Tiago 2:1-9"
  },
  {
    id: "tg-2-q2",
    type: "multiple-choice",
    book: "Tiago",
    chapter: 2,
    difficulty: "walking",
    question: "Qual frase resume o famoso ensinamento de Tiago sobre a fé sem ações em Tiago 2:17 e 2:26?",
    options: [
      "A fé sem obras é morta",
      "A fé substitui a necessidade de qualquer obra",
      "A fé depende unicamente da nossa herança familiar",
      "As obras salvam o homem sem necessidade de fé"
    ],
    correctAnswer: "A fé sem obras é morta",
    explanation: "Tiago argumenta que a fé salvadora verdadeira necessariamente se manifesta em ações práticas de obediência e caridade; caso contrário, é apenas teoria inútil.",
    suggestedReading: "Tiago 2:14-26"
  },
  {
    id: "tg-2-q3",
    type: "multiple-choice",
    book: "Tiago",
    chapter: 2,
    difficulty: "deepening",
    question: "Quais dois personagens do Antigo Testamento Tiago menciona para demonstrar que a fé é justificada por meio de atitudes concretas?",
    options: [
      "Abraão (ao oferecer Isaque) e Raabe (ao acolher os mensageiros)",
      "Moisés (no Egito) e Davi (diante de Golias)",
      "Noé (ao construir a arca) e Daniel (na cova dos leões)",
      "Elias (no Monte Carmelo) e Rute (nos campos de Boaz)"
    ],
    correctAnswer: "Abraão (ao oferecer Isaque) e Raabe (ao acolher os mensageiros)",
    explanation: "Tiago usa dois extremos históricos (um patriarca judeu e uma mulher gentia) para mostrar que a fé viva de ambos produziu atos concretos de obediência (Tiago 2:21-25).",
    suggestedReading: "Tiago 2:21-25"
  },

  // ── Tiago 3 ─────────────────────────────────────────────────────────
  {
    id: "tg-3-q1",
    type: "multiple-choice",
    book: "Tiago",
    chapter: 3,
    difficulty: "beginner",
    question: "Qual parte do corpo humano Tiago compara a um pequeno fogo que pode incendiar uma grande floresta?",
    options: [
      "A língua",
      "A mão",
      "O olho",
      "O coração"
    ],
    correctAnswer: "A língua",
    explanation: "Tiago usa metáforas fortes (freio de cavalo, leme de navio e fagulha de fogo) para ilustrar como a língua tem um poder desproporcional de influenciar e destruir (Tiago 3:3-6).",
    suggestedReading: "Tiago 3:3-6"
  },
  {
    id: "tg-3-q2",
    type: "multiple-choice",
    book: "Tiago",
    chapter: 3,
    difficulty: "walking",
    question: "O que Tiago afirma sobre a capacidade do ser humano de domar a língua pelas próprias forças?",
    options: [
      "Nenhum homem consegue domar a língua sozinho; ela é um mal incontido",
      "Qualquer pessoa disciplinada domina a língua com facilidade",
      "Apenas os filósofos gregos aprenderam a domar a língua",
      "Domar a língua não tem importância na vida espiritual"
    ],
    correctAnswer: "Nenhum homem consegue domar a língua sozinho; ela é um mal incontido",
    explanation: "Tiago 3:7-8 destaca a rebeldia da língua humana, enfatizando a necessidade de transformação espiritual contínua e auxílio divino.",
    suggestedReading: "Tiago 3:7-12"
  },
  {
    id: "tg-3-q3",
    type: "multiple-choice",
    book: "Tiago",
    chapter: 3,
    difficulty: "deepening",
    question: "Quais são as características da 'sabedoria que vem do alto' descritas em Tiago 3:17?",
    options: [
      "Pura, pacífica, moderada, tratável, cheia de misericórdia e de bons frutos, imparcial e sem fingimento",
      "Orgulhosa, teórica, intelectual, misteriosa e restrita a poucos iniciados",
      "Rígida, acusadora, dogmática, voltada à prosperidade e ao poder político",
      "Rápida, agressiva, competitiva, focada no sucesso pessoal a qualquer custo"
    ],
    correctAnswer: "Pura, pacífica, moderada, tratável, cheia de misericórdia e de bons frutos, imparcial e sem fingimento",
    explanation: "A sabedoria divina se diferencia da terrena (que é ciumenta e egoísta) pelos seus frutos morais doces, pacíficos e transparentes (Tiago 3:13-18).",
    suggestedReading: "Tiago 3:13-18"
  },

  // ── Tiago 4 ─────────────────────────────────────────────────────────
  {
    id: "tg-4-q1",
    type: "multiple-choice",
    book: "Tiago",
    chapter: 4,
    difficulty: "beginner",
    question: "Segundo Tiago 4:1-3, qual a verdadeira origem das guerras e contendas no meio da comunidade?",
    options: [
      "Os desejos e cobiças carnais que combatem nos membros do corpo",
      "A falta de leis civis claras impostas pelo Império Romano",
      "As diferenças linguísticas e de sotaques entre os irmãos",
      "A influência direta dos cobradores de impostos da Judeia"
    ],
    correctAnswer: "Os desejos e cobiças carnais que combatem nos membros do corpo",
    explanation: "Tiago diagnostica que os conflitos externos começam nos desejos egoístas e invejas internas não controlados (Tiago 4:1-3).",
    suggestedReading: "Tiago 4:1-3"
  },
  {
    id: "tg-4-q2",
    type: "multiple-choice",
    book: "Tiago",
    chapter: 4,
    difficulty: "walking",
    question: "O que Tiago exorta a fazer em relação a Deus e ao Diabo para alcançar vitória espiritual?",
    options: [
      "Sujeitai-vos a Deus, resisti ao Diabo, e ele fugirá de vós",
      "Resisti a Deus e sujeitai-vos às circunstâncias da vida",
      "Debatei com o Diabo e ignorai os mandamentos de Deus",
      "Afastai-vos de Deus para evitar perseguições do Diabo"
    ],
    correctAnswer: "Sujeitai-vos a Deus, resisti ao Diabo, e ele fugirá de vós",
    explanation: "Tiago 4:7 apresenta o segredo da guerra espiritual: submissão total a Deus associada à postura ativa de rejeição e resistência contra as tentações do mal.",
    suggestedReading: "Tiago 4:7-8"
  },
  {
    id: "tg-4-q3",
    type: "multiple-choice",
    book: "Tiago",
    chapter: 4,
    difficulty: "deepening",
    question: "Qual atitude em relação ao planejamento do futuro Tiago condena no final do capítulo 4?",
    options: [
      "Fazer planos de negócios presunçosos sem incluir a vontade soberana do Senhor",
      "Trabalhar duro para sustentar a própria família no ano seguinte",
      "Viajar para outras províncias para pregar o evangelho aos necessitados",
      "Economizar grãos de trigo para períodos de seca alimentar"
    ],
    correctAnswer: "Fazer planos de negócios presunçosos sem incluir a vontade soberana do Senhor",
    explanation: "Tiago adverte contra a jactância humana de assumir controle do amanhã, lembrando que a vida é curta como a neblina e tudo depende do 'Se o Senhor quiser' (Tiago 4:13-15).",
    suggestedReading: "Tiago 4:13-17"
  },

  // ── Tiago 5 ─────────────────────────────────────────────────────────
  {
    id: "tg-5-q1",
    type: "multiple-choice",
    book: "Tiago",
    chapter: 5,
    difficulty: "beginner",
    question: "Que denúncia grave Tiago faz contra os ricos opressores no início do capítulo 5?",
    options: [
      "Reterem injustamente os salários dos trabalhadores que colheram seus campos",
      "Não pagarem os tributos devidos ao Faraó do Egito",
      "Venderem terras sagradas a preços irrisórios aos gentios",
      "Cobrarem juros baixos demais em empréstimos de caridade"
    ],
    correctAnswer: "Reterem injustamente os salários dos trabalhadores que colheram seus campos",
    explanation: "Tiago profetiza juízo terrível sobre os ricos que acumularam fortunas explorando a mão de obra dos pobres (Tiago 5:1-6).",
    suggestedReading: "Tiago 5:1-6"
  },
  {
    id: "tg-5-q2",
    type: "multiple-choice",
    book: "Tiago",
    chapter: 5,
    difficulty: "walking",
    question: "Qual personagem do Antigo Testamento Tiago cita como um grande exemplo de paciência nas aflições?",
    options: [
      "Jó, cujo sofrimento e fim revelaram a misericórdia do Senhor",
      "Sansão, em sua luta final contra os filisteus",
      "Saul, em sua paciência com os profetas de Israel",
      "Jonas, ao aguardar a destruição de Nínive"
    ],
    correctAnswer: "Jó, cujo sofrimento e fim revelaram a misericórdia do Senhor",
    explanation: "Tiago aponta a perseverança de Jó como exemplo de que, apesar da dor profunda, Deus traz um desfecho compassivo a quem confia nEle (Tiago 5:11).",
    suggestedReading: "Tiago 5:10-11"
  },
  {
    id: "tg-5-q3",
    type: "multiple-choice",
    book: "Tiago",
    chapter: 5,
    difficulty: "deepening",
    question: "Quem é citado por Tiago como exemplo de homem com natureza humana igual à nossa, mas cuja oração fervorosa fez cessar e retornar a chuva?",
    options: [
      "Elias, o profeta",
      "Moisés, o libertador",
      "Davi, o salmista",
      "Samuel, o sacerdote"
    ],
    correctAnswer: "Elias, o profeta",
    explanation: "Tiago usa Elias para ilustrar que a oração do justo é poderosa e eficaz. Elias era um ser humano comum (sujeito às mesmas paixões), mas orou com fé e Deus respondeu extraordinariamente (Tiago 5:17-18).",
    suggestedReading: "Tiago 5:16-18"
  },

  // ══════════════════════════════════════════════════════════════════════
  // 1 JOÃO (LIVRO COMPLETO - CAPÍTULOS 1 A 5)
  // ══════════════════════════════════════════════════════════════════════

  // ── 1 João 1 ────────────────────────────────────────────────────────
  {
    id: "1jo-1-q1",
    type: "multiple-choice",
    book: "1 João",
    chapter: 1,
    difficulty: "beginner",
    question: "Como o autor descreve seu contato pessoal e empírico com a 'Palavra da Vida' (Jesus Cristo) no início do capítulo?",
    options: [
      "Ouviu, viu com os próprios olhos, contemplou e suas mãos apalparam",
      "Ouviu falar apenas por meio de sonhos e visões celestiais",
      "Apenas leu a respeito em rolos antigos da sinagoga",
      "Recebeu a mensagem por meio de relatos de viajantes gregos"
    ],
    correctAnswer: "Ouviu, viu com os próprios olhos, contemplou e suas mãos apalparam",
    explanation: "João inicia combatendo heresias antigas (como o gnosticismo, que negava a realidade física de Jesus) afirmando a tangibilidade física de seu ministério (1 João 1:1-3).",
    suggestedReading: "1 João 1:1-3"
  },
  {
    id: "1jo-1-q2",
    type: "multiple-choice",
    book: "1 João",
    chapter: 1,
    difficulty: "walking",
    question: "Qual a mensagem central que João afirma ter ouvido de Jesus e que anuncia aos leitores em 1 João 1:5?",
    options: [
      "Deus é luz, e não há nele treva nenhuma",
      "Deus perdoa apenas quem nunca errou",
      "A salvação é restrita aos intelectuais da Judeia",
      "As trevas são mais poderosas do que a luz terrena"
    ],
    correctAnswer: "Deus é luz, e não há nele treva nenhuma",
    explanation: "A metáfora da 'luz' define a pureza absoluta, santidade e verdade de Deus, estabelecendo que andar com Deus exige andar na verdade e na luz (1 João 1:5-7).",
    suggestedReading: "1 João 1:5-7"
  },
  {
    id: "1jo-1-q3",
    type: "multiple-choice",
    book: "1 João",
    chapter: 1,
    difficulty: "deepening",
    question: "Segundo 1 João 1:8-9, o que acontece se dissermos que não temos pecado, e o que Deus faz se confessarmos os nossos pecados?",
    options: [
      "Se dissermos que não temos pecamos, enganamo-nos; se confessarmos, Deus é fiel e justo para nos perdoar",
      "Deus nos rejeita se souber que pecamos; confessar não altera a nossa culpa",
      "Dizer que não temos pecado nos justifica; confessar serve apenas para os pagãos",
      "A confissão deve ser feita apenas uma vez na vida em um ritual público"
    ],
    correctAnswer: "Se dissermos que não temos pecamos, enganamo-nos; se confessarmos, Deus é fiel e justo para nos perdoar",
    explanation: "A honestidade espiritual sobre nossas fraquezas e a confissão são pré-requisitos para receber o perdão gracioso e a purificação de Deus (1 João 1:8-10).",
    suggestedReading: "1 João 1:8-10"
  },

  // ── 1 João 2 ────────────────────────────────────────────────────────
  {
    id: "1jo-2-q1",
    type: "multiple-choice",
    book: "1 João",
    chapter: 2,
    difficulty: "beginner",
    question: "A quem João apresenta como o nosso 'Advogado' junto ao Pai para nos defender quando pecamos?",
    options: [
      "Jesus Cristo, o Justo, que é a propiciação pelos nossos pecados",
      "O apóstolo Pedro e a igreja apostólica",
      "O anjo da guarda que nos protege no deserto",
      "Moisés, o legislador do Antigo Testamento"
    ],
    correctAnswer: "Jesus Cristo, o Justo, que é a propiciação pelos nossos pecados",
    explanation: "Jesus é apresentado como o defensor e a própria oferta de reconciliação (propiciação) que garante nossa absolvição diante da justiça divina (1 João 2:1-2).",
    suggestedReading: "1 João 2:1-2"
  },
  {
    id: "1jo-2-q2",
    type: "multiple-choice",
    book: "1 João",
    chapter: 2,
    difficulty: "walking",
    question: "Qual o teste prático de obediência que João estabelece para provar que realmente conhecemos a Deus de verdade?",
    options: [
      "Aquele que diz: 'Eu o conheço', e guarda os seus mandamentos",
      "A capacidade de explicar mistérios complexos da lei",
      "Ter sentimentos místicos e êxtases espirituais no templo",
      "Falar fluentemente diversos idiomas estrangeiros"
    ],
    correctAnswer: "Aquele que diz: 'Eu o conheço', e guarda os seus mandamentos",
    explanation: "Conhecer a Deus não é mero intelecto, mas relacionamento vivo expresso em obediência de vida e amor fraternal (1 João 2:3-6).",
    suggestedReading: "1 João 2:3-6"
  },
  {
    id: "1jo-2-q3",
    type: "multiple-choice",
    book: "1 João",
    chapter: 2,
    difficulty: "deepening",
    question: "Qual advertência radical João faz em 1 João 2:15 sobre o perigo de amar o mundo ou o que nele há?",
    options: [
      "Se alguém amar o mundo, o amor do Pai não está nele",
      "Amar o mundo é aceitável desde que se frequente os cultos",
      "Deus perdoa quem ama o mundo mais do que a Bíblia",
      "O mundo retribui o amor com riquezas eternas"
    ],
    correctAnswer: "Se alguém amar o mundo, o amor do Pai não está nele",
    explanation: "Os valores do sistema mundano corrompido (cobiça dos olhos, da carne e soberba da vida) são incompatíveis com o reino eterno de Deus (1 João 2:15-17).",
    suggestedReading: "1 João 2:15-17"
  },

  // ── 1 João 3 ────────────────────────────────────────────────────────
  {
    id: "1jo-3-q1",
    type: "multiple-choice",
    book: "1 João",
    chapter: 3,
    difficulty: "beginner",
    question: "Que grande privilégio de identidade amorosa concedido por Deus Pai é destacado logo no versículo 1 deste capítulo?",
    options: [
      "O de sermos chamados filhos de Deus",
      "O de recebermos riquezas materiais abundantes na terra",
      "O de podermos governar os reinos políticos deste mundo",
      "O de nunca passarmos por qualquer sofrimento físico"
    ],
    correctAnswer: "O de sermos chamados filhos de Deus",
    explanation: "João se maravilha com o amor do Pai, que nos adota e nos dá a identidade de Seus verdadeiros filhos (1 João 3:1-2).",
    suggestedReading: "1 João 3:1-2"
  },
  {
    id: "1jo-3-q2",
    type: "multiple-choice",
    book: "1 João",
    chapter: 3,
    difficulty: "walking",
    question: "Como João descreve a forma correta como os cristãos devem amar uns aos outros na prática?",
    options: [
      "Não amando de palavra nem de língua, mas por obra e em verdade",
      "Amando apenas os irmãos que pensam exatamente como nós",
      "Apenas desejando verbalmente que os outros tenham paz",
      "Apenas fazendo doações quando sobrar recursos"
    ],
    correctAnswer: "Não amando de palavra nem de língua, mas por obra e em verdade",
    explanation: "O amor cristão (Ágape) é sacrificial e ativo, comprovado por ações tangíveis de solidariedade e não apenas por retórica (1 João 3:16-18).",
    suggestedReading: "1 João 3:16-18"
  },
  {
    id: "1jo-3-q3",
    type: "multiple-choice",
    book: "1 João",
    chapter: 3,
    difficulty: "deepening",
    question: "A quem João compara aquele que abriga ódio e falta de amor contra o seu irmão de fé?",
    options: [
      "A um homicida, sabendo que nenhum homicida tem a vida eterna em si",
      "A um arqueiro que erra o alvo por falta de treino",
      "A um marinheiro que cochila durante a tempestade",
      "A um publicano cobrador de impostos romanos"
    ],
    correctAnswer: "A um homicida, sabendo que nenhum homicida tem a vida eterna em si",
    explanation: "João traça uma linha ética rigorosa: o ódio no coração contra o irmão é a semente do homicídio e revela ausência de conversão espiritual genuína (1 João 3:15).",
    suggestedReading: "1 João 3:13-15"
  },

  // ── 1 João 4 ────────────────────────────────────────────────────────
  {
    id: "1jo-4-q1",
    type: "multiple-choice",
    book: "1 João",
    chapter: 4,
    difficulty: "beginner",
    question: "Que recomendação João dá aos cristãos para evitar que sejam enganados por falsos ensinadores?",
    options: [
      "Não creiais em qualquer espírito, mas provai se os espíritos são de Deus",
      "Ignorai qualquer pessoa que fale sobre o futuro",
      "Aceitai todos os ensinamentos novos sem fazer questionamentos",
      "Procurai apenas líderes que façam milagres visuais rápidos"
    ],
    correctAnswer: "Não creiais em qualquer espírito, mas provai se os espíritos são de Deus",
    explanation: "O discernimento espiritual é vital; a igreja deve examinar e julgar a doutrina ensinada com base na verdade bíblica e no testemunho apostólico (1 João 4:1-3).",
    suggestedReading: "1 João 4:1-3"
  },
  {
    id: "1jo-4-q2",
    type: "multiple-choice",
    book: "1 João",
    chapter: 4,
    difficulty: "walking",
    question: "Qual definição célebre e direta do caráter essencial de Deus João apresenta por duas vezes neste capítulo?",
    options: [
      "Deus é amor",
      "Deus é força",
      "Deus é mistério",
      "Deus é silêncio"
    ],
    correctAnswer: "Deus é amor",
    explanation: "Em 1 João 4:8 e 4:16, João define que a essência e a motivação de todas as ações de Deus provêm do Seu amor supremo (Ágape).",
    suggestedReading: "1 João 4:7-16"
  },
  {
    id: "1jo-4-q3",
    type: "multiple-choice",
    book: "1 João",
    chapter: 4,
    difficulty: "deepening",
    question: "Qual o impacto do 'perfeito amor' de Deus no medo que assola o coração humano, segundo 1 João 4:18?",
    options: [
      "O perfeito amor lança fora o medo, porque o medo produz tormento",
      "O amor convive com o medo para manter o homem humilde",
      "O medo aumenta à medida que o amor de Deus cresce no homem",
      "O amor espiritual não interfere nos medos emocionais da vida"
    ],
    correctAnswer: "O perfeito amor lança fora o medo, porque o medo produz tormento",
    explanation: "O relacionamento correto com Deus baseado no amor elimina a ansiedade do juízo e o pavor, trazendo segurança e paz espiritual (1 João 4:17-19).",
    suggestedReading: "1 João 4:17-19"
  },

  // ── 1 João 5 ────────────────────────────────────────────────────────
  {
    id: "1jo-5-q1",
    type: "multiple-choice",
    book: "1 João",
    chapter: 5,
    difficulty: "beginner",
    question: "De acordo com 1 João 5:4, o que é identificado como a vitória que vence as seduções e pressões do mundo?",
    options: [
      "A nossa fé em Jesus Cristo",
      "A nossa força militar e política",
      "O acúmulo de sabedoria secular humana",
      "A quantidade de rituais religiosos que fazemos"
    ],
    correctAnswer: "A nossa fé em Jesus Cristo",
    explanation: "A fé no Filho de Deus nos conecta ao poder divino que nos capacita a rejeitar os caminhos pecaminosos do sistema mundial (1 João 5:4-5).",
    suggestedReading: "1 João 5:1-5"
  },
  {
    id: "1jo-5-q2",
    type: "multiple-choice",
    book: "1 João",
    chapter: 5,
    difficulty: "walking",
    question: "Quais são os três elementos citados em 1 João 5:8 que dão testemunho concorde sobre Cristo na terra?",
    options: [
      "O Espírito, a água e o sangue",
      "Os profetas, os reis e os sacerdotes",
      "O céu, a terra e o mar profundo",
      "Os apóstolos, os anjos e os santos"
    ],
    correctAnswer: "O Espírito, a água e o sangue",
    explanation: "A água (provavelmente o batismo de Jesus) e o sangue (sua morte na cruz), atestados pelo testemunho interno do Espírito Santo, confirmam a messianidade histórica de Jesus (1 João 5:6-9).",
    suggestedReading: "1 João 5:6-9"
  },
  {
    id: "1jo-5-q3",
    type: "multiple-choice",
    book: "1 João",
    chapter: 5,
    difficulty: "deepening",
    question: "Com qual exortação prática e direta João encerra abruptamente a sua primeira epístola no versículo 21?",
    options: [
      "Filhinhos, guardai-vos dos ídolos",
      "Irmãos, orai pelos doentes com óleo",
      "Santos, reuni-vos no primeiro dia da semana",
      "Amados, escrevei cartas a todas as igrejas"
    ],
    correctAnswer: "Filhinhos, guardai-vos dos ídolos",
    explanation: "Após apresentar a certeza da vida eterna em Cristo (o verdadeiro Deus), João adverte os leitores a evitarem qualquer falso substituto de Deus (idolatria) (1 João 5:20-21).",
    suggestedReading: "1 João 5:20-21"
  },

  // ══════════════════════════════════════════════════════════════════════
  // 2 JOÃO (LIVRO COMPLETO - 1 CAPÍTULO)
  // ══════════════════════════════════════════════════════════════════════
  {
    id: "2jo-1-q1",
    type: "multiple-choice",
    book: "2 João",
    chapter: 1,
    difficulty: "beginner",
    question: "A quem o autor, que se autointitula 'o Presbítero', destina formalmente a sua segunda epístola?",
    options: [
      "À senhora eleita e aos seus filhos",
      "Ao amado Gaio, seu colaborador",
      "À igreja que se reúne em Roma",
      "Aos doze apóstolos exilados"
    ],
    correctAnswer: "À senhora eleita e aos seus filhos",
    explanation: "2 João 1:1 é endereçado à 'senhora eleita', termo que pode se referir a uma comunidade cristã local específica (personificada) ou a uma senhora cristã de destaque.",
    suggestedReading: "2 João 1:1-3"
  },
  {
    id: "2jo-1-q2",
    type: "multiple-choice",
    book: "2 João",
    chapter: 1,
    difficulty: "walking",
    question: "Qual mandamento prático o Presbítero relembra e insiste para que seja praticado mutuamente na igreja?",
    options: [
      "Que andemos em amor uns para com os outros, segundo os Seus mandamentos",
      "Que jejuemos duas vezes por semana nas quartas e sextas",
      "Que vendamos todos os bens para ajudar os necessitados de Jerusalém",
      "Que construamos sinagogas em cada província visitada"
    ],
    correctAnswer: "Que andemos em amor uns para com os outros, segundo os Seus mandamentos",
    explanation: "João reforça a centralidade do amor prático e da obediência à verdade como marcas definidoras da comunidade cristã (2 João 1:5-6).",
    suggestedReading: "2 João 1:5-6"
  },
  {
    id: "2jo-1-q3",
    type: "multiple-choice",
    book: "2 João",
    chapter: 1,
    difficulty: "deepening",
    question: "Qual instrução rigorosa o apóstolo dá sobre falsos mestres itinerantes que não trazem a doutrina correta de Cristo?",
    options: [
      "Não os recebais em casa, nem lhes deis boas-vindas (saudeis)",
      "Acolhei-os e debatei filosofia por vários dias com eles",
      "Dai-lhes sustento financeiro temporário antes de irem embora",
      "Denunciai-os imediatamente ao governador romano local"
    ],
    correctAnswer: "Não os recebais em casa, nem lhes deis boas-vindas (saudeis)",
    explanation: "A hospitalidade antiga servia para patrocinar ministérios. João adverte a igreja a não apoiar nem legitimar o trabalho de falsos mestres que distorcem o evangelho (2 João 1:10-11).",
    suggestedReading: "2 João 1:7-11"
  },

  // ══════════════════════════════════════════════════════════════════════
  // 3 JOÃO (LIVRO COMPLETO - 1 CAPÍTULO)
  // ══════════════════════════════════════════════════════════════════════
  {
    id: "3jo-1-q1",
    type: "multiple-choice",
    book: "3 João",
    chapter: 1,
    difficulty: "beginner",
    question: "A quem o Presbítero escreve esta epístola pessoal, elogiando sua fidelidade em hospedar os irmãos itinerantes?",
    options: [
      "Ao amado Gaio",
      "A Diótrefes, o líder local",
      "Ao discípulo Timóteo",
      "Ao resgatador Boaz"
    ],
    correctAnswer: "Ao amado Gaio",
    explanation: "3 João 1:1 é nominalmente direcionada a Gaio, a quem o autor expressa profundo amor fraternal e elogia pelo seu espírito hospitaleiro com os missionários (3 João 1:3-6).",
    suggestedReading: "3 João 1:1-6"
  },
  {
    id: "3jo-1-q2",
    type: "multiple-choice",
    book: "3 João",
    chapter: 1,
    difficulty: "walking",
    question: "Quem é o personagem duramente repreendido pelo apóstolo por gostar de exercer a primazia (liderar com orgulho) e rejeitar a autoridade dos apóstolos?",
    options: [
      "Diótrefes",
      "Demétrio",
      "Epafrodito",
      "Alexandre"
    ],
    correctAnswer: "Diótrefes",
    explanation: "Diótrefes é citado como exemplo negativo de autoritarismo na igreja, pois espalhava mexericos e expulsava os irmãos acolhedores da comunidade (3 João 1:9-10).",
    suggestedReading: "3 João 1:9-10"
  },
  {
    id: "3jo-1-q3",
    type: "multiple-choice",
    book: "3 João",
    chapter: 1,
    difficulty: "deepening",
    question: "Quem é o irmão que o apóstolo elogia no final da carta, afirmando que tem bom testemunho de todos e da própria verdade?",
    options: [
      "Demétrio",
      "Gaio",
      "Diótrefes",
      "Onésimo"
    ],
    correctAnswer: "Demétrio",
    explanation: "Demétrio é apresentado como modelo positivo de conduta cristã, cujo caráter é atestado pela comunidade e pela própria verdade do evangelho (3 João 1:12).",
    suggestedReading: "3 João 1:11-12"
  },

  // ══════════════════════════════════════════════════════════════════════
  // FILEMOM (LIVRO COMPLETO - 1 CAPÍTULO)
  // ══════════════════════════════════════════════════════════════════════
  {
    id: "fm-1-q1",
    type: "multiple-choice",
    book: "Filemom",
    chapter: 1,
    difficulty: "beginner",
    question: "Qual era a relação inicial entre Filemom e Onésimo, o personagem sobre o qual Paulo faz o apelo central da epístola?",
    options: [
      "Onésimo era escravo de Filemom e havia fugido de sua casa",
      "Onésimo era o filho mais jovem de Filemom que havia se perdido",
      "Onésimo era o cobrador de dívidas agrícolas de Filemom",
      "Onésimo era o pastor de ovelhas contratado por Filemom"
    ],
    correctAnswer: "Onésimo era escravo de Filemom e havia fugido de sua casa",
    explanation: "A epístola aborda o tema de Onésimo, que fugira da casa de seu senhor Filemom, um líder cristão na cidade de Colossos (Filemom 1:11-16).",
    suggestedReading: "Filemom 1:8-16"
  },
  {
    id: "fm-1-q2",
    type: "multiple-choice",
    book: "Filemom",
    chapter: 1,
    difficulty: "walking",
    question: "O que aconteceu com Onésimo durante o tempo em que esteve com Paulo em Roma, enquanto Paulo estava na prisão?",
    options: [
      "Ele se converteu ao evangelho por meio do ministério de Paulo",
      "Ele aprendeu a cidadania romana para escapar da escravidão",
      "Ele foi contratado como guarda militar da prisão de Paulo",
      "Ele adoeceu gravemente e foi resgatado por Epafrodito"
    ],
    correctAnswer: "Ele se converteu ao evangelho por meio do ministério de Paulo",
    explanation: "Paulo chama Onésimo de 'meu filho, que gerei nas minhas prisões', indicando que Onésimo aceitou a fé sob o ensino de Paulo (Filemom 1:10).",
    suggestedReading: "Filemom 1:10"
  },
  {
    id: "fm-1-q3",
    type: "multiple-choice",
    book: "Filemom",
    chapter: 1,
    difficulty: "deepening",
    question: "Como Paulo exorta amorosamente Filemom a receber Onésimo de volta em sua casa?",
    options: [
      "Não mais como escravo, mas como irmão amado no Senhor",
      "Como um prisioneiro condenado a castigos físicos exemplares",
      "Como um devedor que deve trabalhar de graça por toda a vida",
      "Como um desconhecido que deve morar fora das propriedades dele"
    ],
    correctAnswer: "Não mais como escravo, mas como irmão amado no Senhor",
    explanation: "Paulo convida Filemom a transformar a relação social de escravidão em uma comunhão espiritual eterna, acolhendo-o como a um irmão de fé e ao próprio Paulo (Filemom 1:15-17).",
    suggestedReading: "Filemom 1:15-19"
  },

  // ══════════════════════════════════════════════════════════════════════
  // JUDAS (LIVRO COMPLETO - 1 CAPÍTULO)
  // ══════════════════════════════════════════════════════════════════════
  {
    id: "jd-1-q1",
    type: "multiple-choice",
    book: "Judas",
    chapter: 1,
    difficulty: "beginner",
    question: "Por qual finalidade urgente Judas mudou seu propósito inicial de escrita e escreveu esta epístola aos cristãos?",
    options: [
      "Para exortá-los a batalhar ativamente pela fé que uma vez foi dada aos santos",
      "Para arrecadar recursos financeiros para as igrejas da Galácia",
      "Para detalhar a reconstrução física do templo em Jerusalém",
      "Para explicar as profecias apocalípticas de Daniel"
    ],
    correctAnswer: "Para exortá-los a batalhar ativamente pela fé que uma vez foi dada aos santos",
    explanation: "Judas afirma que pretendia escrever sobre a salvação comum, mas sentiu a urgência de alertar e conclamar o povo contra falsos mestres infiltrados (Judas 1:3).",
    suggestedReading: "Judas 1:3-4"
  },
  {
    id: "jd-1-q2",
    type: "multiple-choice",
    book: "Judas",
    chapter: 1,
    difficulty: "walking",
    question: "Quais três exemplos clássicos do julgamento de Deus no Antigo Testamento Judas cita para ilustrar que a impiedade e a rebeldia serão punidas?",
    options: [
      "O povo libertado do Egito que descreu, os anjos rebeldes e as cidades de Sodoma e Gomorra",
      "O dilúvio de Noé, a torre de Babel e as pragas do Egito",
      "A queda das muralhas de Jericó, o exílio na Babilônia e a cova dos leões",
      "A morte de Golias, a lepra de Geazi e a cova de Coré"
    ],
    correctAnswer: "O povo libertado do Egito que descreu, os anjos rebeldes e as cidades de Sodoma e Gomorra",
    explanation: "Judas traz memórias históricas da gravidade de desobedecer a Deus e viver em imoralidade, provando que o julgamento divino é certo e real (Judas 1:5-7).",
    suggestedReading: "Judas 1:5-7"
  },
  {
    id: "jd-1-q3",
    type: "multiple-choice",
    book: "Judas",
    chapter: 1,
    difficulty: "deepening",
    question: "Que disputa incomum envolvendo figuras sobrenaturais é mencionada por Judas no versículo 9 como exemplo de respeito à autoridade?",
    options: [
      "A disputa entre o arcanjo Miguel e o Diabo pelo corpo de Moisés",
      "A luta de Jacó com o anjo do Senhor no vau do Jaboque",
      "O confronto do profeta Elias com os falsos profetas de Baal",
      "A revelação de Gabriel ao profeta Daniel no rio Tigre"
    ],
    correctAnswer: "A disputa entre o arcanjo Miguel e o Diabo pelo corpo de Moisés",
    explanation: "Judas relata que mesmo o arcanjo Miguel, ao disputar com o diabo, não proferiu acusação injuriosa, mas disse: 'O Senhor te repreenda', contrastando com a arrogância dos falsos mestres (Judas 1:9).",
    suggestedReading: "Judas 1:8-10"
  },

  // ── Questões Gerais ───────────────────────────────────────────────────
  {
    id: "gen-q-m1",
    type: "matching",
    difficulty: "walking",
    question:
      "Relacione os seguintes personagens bíblicos marcantes com seus respectivos acontecimentos e provações:",
    matchingLeft: ["Moisés", "Daniel", "Jonas", "Noé"],
    matchingRight: [
      "Liderou o Êxodo e a travessia do Mar Vermelho",
      "Foi jogado na cova dos leões por orar a Deus",
      "Fugiu de Deus e foi engolido por um grande peixe",
      "Construiu a arca obedecendo ao mandado de Deus",
    ],
    correctAnswer:
      "Moisés: Liderou o Êxodo, Daniel: Cova dos Leões, Jonas: Grande peixe, Noé: Construiu a arca",
    explanation:
      "Moisés liderou a libertação do Egito; Daniel foi poupado na cova dos leões; Jonas tentou fugir e foi engolido por um peixe; Noé construiu a arca sob ordem divina.",
    suggestedReading: "Hebreus 11",
  },
  {
    id: "gen-q-c1",
    type: "chronological",
    difficulty: "deepening",
    question:
      "Ordene cronologicamente os seguintes grandes acontecimentos da história bíblica (do mais antigo para o mais recente):",
    chronologicalItems: [
      "A Chamada de Abraão",
      "A Construção do Templo por Salomão",
      "O Cativeiro na Babilônia",
      "O Ministério de Jesus na Terra",
    ],
    correctAnswer:
      "A Chamada de Abraão, A Construção do Templo por Salomão, O Cativeiro na Babilônia, O Ministério de Jesus na Terra",
    explanation:
      "Abraão viveu por volta de 2000 a.C. Salomão construiu o templo em c. 960 a.C. O cativeiro na Babilônia começou em 586 a.C. O ministério terreno de Jesus ocorreu no início do século I d.C.",
    suggestedReading: "Atos 7",
  },
  {
    id: "gen-q-who1",
    type: "multiple-choice",
    difficulty: "beginner",
    question: "Quem declarou a célebre frase: 'Eu e a minha casa serviremos ao Senhor'?",
    options: ["Davi", "Moisés", "Josué", "Samuel"],
    correctAnswer: "Josué",
    explanation:
      "Josué proferiu essas palavras no final da sua vida, ao desafiar o povo a escolher a quem serviriam (Josué 24:15).",
    suggestedReading: "Josué 24",
  },
  {
    id: "gen-q-where1",
    type: "multiple-choice",
    difficulty: "beginner",
    question:
      "Em qual localidade da Judeia, conforme profetizado pelos profetas do Antigo Testamento, nasceu Jesus?",
    options: ["Nazaré", "Belém", "Jerusalém", "Jericó"],
    correctAnswer: "Belém",
    explanation:
      "Jesus nasceu em Belém da Judeia no tempo do rei Herodes, cumprindo a profecia de Miqueias 5:2 (conforme registrado em Mateus 2:1-6).",
    suggestedReading: "Mateus 2",
  },
];

// Helper: Get quiz for a specific chapter
export function getChapterQuiz(book: string, chapter: number, count: number = 3): BibleQuestion[] {
  // Try to find questions for this specific book and chapter
  const matches = BIBLE_QUESTIONS.filter(
    (q) => q.book?.toLowerCase() === book.toLowerCase() && q.chapter === chapter,
  );

  return matches.slice(0, count);
}

// Helper: Get adaptive quiz based on profile difficulty level
export function getAdaptiveQuiz(
  difficulty: "beginner" | "walking" | "deepening",
  count: number = 5,
): BibleQuestion[] {
  // Filter questions matching difficulty
  const matches = BIBLE_QUESTIONS.filter((q) => q.difficulty === difficulty);

  if (matches.length >= count) {
    return matches.slice(0, count).sort(() => Math.random() - 0.5);
  }

  // If not enough, take a mix of all questions
  const all = [...BIBLE_QUESTIONS].sort(() => Math.random() - 0.5);
  return all.slice(0, count);
}

// Helper: Record individual answer status and update stats / simple achievements
// Also syncs to Supabase quiz_stats for cross-device persistence
export function recordAnswer(isCorrect: boolean): string[] {
  if (typeof window === "undefined") return [];

  // Track total questions answered (local cache for instant UI)
  const currentTotal = Number(localStorage.getItem("bible.stats.totalQuestionsCount") || "0");
  const newTotal = currentTotal + 1;
  localStorage.setItem("bible.stats.totalQuestionsCount", String(newTotal));

  let newCorrect = Number(localStorage.getItem("bible.stats.correctAnswersCount") || "0");

  if (isCorrect) {
    newCorrect += 1;
    localStorage.setItem("bible.stats.correctAnswersCount", String(newCorrect));
  }

  // Sync to Supabase asynchronously (fire-and-forget)
  import("@/integrations/supabase/client")
    .then(({ supabase }) => {
      supabase.auth.getUser().then(({ data }) => {
        if (!data.user) return;

        // Update quiz stats
        supabase
          .from("quiz_stats")
          .upsert(
            {
              user_id: data.user.id,
              correct_answers: newCorrect,
              total_answers: newTotal,
            },
            { onConflict: "user_id" },
          )
          .then(() => {});

        // Log quiz activity
        import("@/lib/activity").then(({ logActivity }) => {
          logActivity(data.user.id, "quiz", { isCorrect, total: newTotal, correct: newCorrect });
        });

        if (isCorrect) {
          // Check achievements
          const completedChallengesRaw = localStorage.getItem("bible.completedChallenges") || "[]";
          let completed: string[] = [];
          try {
            completed = JSON.parse(completedChallengesRaw);
          } catch (e) {
            completed = [];
          }

          let newlyUnlocked: string[] = [];

          if (newCorrect >= 1 && !completed.includes("first_step")) {
            completed.push("first_step");
            newlyUnlocked.push("Primeiro Passo");
          }
          if (newCorrect >= 10 && !completed.includes("constancy")) {
            completed.push("constancy");
            newlyUnlocked.push("Constância");
          }

          if (newlyUnlocked.length > 0) {
            localStorage.setItem("bible.completedChallenges", JSON.stringify(completed));
            // Sync achievements to Supabase profiles
            supabase
              .from("profiles")
              .update({
                completed_challenges: completed,
              })
              .eq("id", data.user.id)
              .then(() => {});
          }
        }
      });
    })
    .catch(() => {});

  if (isCorrect) {
    // Check achievements (local check for instant return)
    const completedChallengesRaw = localStorage.getItem("bible.completedChallenges") || "[]";
    let completed: string[] = [];
    try {
      completed = JSON.parse(completedChallengesRaw);
    } catch (e) {
      completed = [];
    }

    let newlyUnlocked: string[] = [];

    if (newCorrect >= 1 && !completed.includes("first_step")) {
      completed.push("first_step");
      newlyUnlocked.push("Primeiro Passo");
    }
    if (newCorrect >= 10 && !completed.includes("constancy")) {
      completed.push("constancy");
      newlyUnlocked.push("Constância");
    }

    return newlyUnlocked;
  } else {
    return [];
  }
}

// Helper: Record quiz completion and check for specific chapter achievements
export function recordQuizCompletion(
  book: string,
  chapter: number,
  score: number,
  total: number,
): string[] {
  if (typeof window === "undefined") return [];

  const completedChallengesRaw = localStorage.getItem("bible.completedChallenges") || "[]";
  let completed: string[] = [];
  try {
    completed = JSON.parse(completedChallengesRaw);
  } catch (e) {
    completed = [];
  }

  let newlyUnlocked: string[] = [];

  if (score === total) {
    if (
      book.toLowerCase() === "gênesis" &&
      chapter === 1 &&
      !completed.includes("genesis_specialist")
    ) {
      completed.push("genesis_specialist");
      newlyUnlocked.push("Especialista em Gênesis");
    }
    if (
      book.toLowerCase() === "joão" &&
      chapter === 1 &&
      !completed.includes("gospels_connoisseur")
    ) {
      completed.push("gospels_connoisseur");
      newlyUnlocked.push("Conhecedor dos Evangelhos");
    }
  }

  if (newlyUnlocked.length > 0) {
    localStorage.setItem("bible.completedChallenges", JSON.stringify(completed));
    // Sync achievements to Supabase profiles
    import("@/integrations/supabase/client")
      .then(({ supabase }) => {
        supabase.auth.getUser().then(({ data }) => {
          if (!data.user) return;
          supabase
            .from("profiles")
            .update({
              completed_challenges: completed,
            })
            .eq("id", data.user.id)
            .then(() => {});
        });
      })
      .catch(() => {});
  }
  return newlyUnlocked;
}
