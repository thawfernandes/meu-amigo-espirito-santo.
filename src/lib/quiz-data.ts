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

export const BIBLE_QUESTIONS: BibleQuestion[] = [
  // ── Gênesis 1 ──────────────────────────────────────────────────────────
  {
    id: "gn-1-q1",
    type: "multiple-choice",
    book: "Gênesis",
    chapter: 1,
    difficulty: "beginner",
    question: "O que Deus criou no princípio, de acordo com Gênesis 1:1?",
    options: ["O homem e a mulher", "Os céus e a terra", "O sol, a lua e as estrelas", "Os animais marinhos"],
    correctAnswer: "Os céus e a terra",
    explanation: "Gênesis 1:1 afirma textualmente: 'No princípio Deus criou os céus e a terra', estabelecendo Deus como o Criador Soberano de todo o universo antes de iniciar os detalhes da criação.",
    suggestedReading: "Gênesis 1"
  },
  {
    id: "gn-1-q2",
    type: "true-false",
    book: "Gênesis",
    chapter: 1,
    difficulty: "beginner",
    question: "A terra já estava totalmente organizada e cheia de seres vivos no princípio, antes de Deus dizer 'Haja luz'. Verdadeiro ou Falso?",
    options: ["Verdadeiro", "Falso"],
    correctAnswer: "Falso",
    explanation: "A Bíblia diz em Gênesis 1:2 que 'a terra era sem forma e vazia' e 'trevas cobriam a face do abismo', o que significa que o estado inicial era desolado e desabitado antes da ação organizadora de Deus.",
    suggestedReading: "Gênesis 1"
  },
  {
    id: "gn-1-q3",
    type: "multiple-choice",
    book: "Gênesis",
    chapter: 1,
    difficulty: "walking",
    question: "O que Deus criou no primeiro dia da criação ao ordenar com a Sua palavra?",
    options: ["As plantas e árvores", "O sol e a lua", "A luz e a separação das trevas", "O firmamento"],
    correctAnswer: "A luz e a separação das trevas",
    explanation: "Deus disse: 'Haja luz', e houve luz. Deus viu que a luz era boa e fez separação entre a luz e as trevas, chamando à luz Dia e às trevas Noite (Gênesis 1:3-5).",
    suggestedReading: "Gênesis 1"
  },

  // ── Salmos 23 ──────────────────────────────────────────────────────────
  {
    id: "sl-23-q1",
    type: "fill-blank",
    book: "Salmos",
    chapter: 23,
    difficulty: "beginner",
    question: "Complete o versículo do Salmo 23:1: 'O Senhor é o meu ________, de nada terei falta.'",
    correctAnswer: "pastor",
    explanation: "O Salmo 23, escrito por Davi, utiliza a metáfora do pastor de ovelhas para demonstrar o cuidado protetor, guia e provisão diária que Deus oferece aos Seus filhos.",
    suggestedReading: "Salmos 23"
  },
  {
    id: "sl-23-q2",
    type: "multiple-choice",
    book: "Salmos",
    chapter: 23,
    difficulty: "walking",
    question: "Segundo o Salmo 23, para onde o bom pastor conduz as suas ovelhas para descansar?",
    options: ["Para o alto de montanhas áridas", "A águas tranquilas e pastagens verdes", "Para o meio de espinhos protetores", "Para a entrada de cavernas escuras"],
    correctAnswer: "A águas tranquilas e pastagens verdes",
    explanation: "O versículo 2 descreve: 'Em verdes pastagens me faz repousar e me conduz a águas tranquilas', indicando descanso físico e paz espiritual que Deus concede.",
    suggestedReading: "Salmos 23"
  },

  // ── João 1 ─────────────────────────────────────────────────────────────
  {
    id: "jo-1-q1",
    type: "multiple-choice",
    book: "João",
    chapter: 1,
    difficulty: "beginner",
    question: "No prólogo do Evangelho de João (João 1:1), quem é identificado como estando com Deus no princípio e sendo Deus?",
    options: ["João Batista", "Moisés", "O Verbo (ou a Palavra)", "O Anjo Gabriel"],
    correctAnswer: "O Verbo (ou a Palavra)",
    explanation: "João 1:1 declara: 'No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus', uma afirmação fundamental da eternidade e divindade de Jesus Cristo.",
    suggestedReading: "João 1"
  },
  {
    id: "jo-1-q2",
    type: "context",
    book: "João",
    chapter: 1,
    difficulty: "deepening",
    question: "Qual o significado histórico e teológico do termo grego 'Logos' (traduzido como Verbo/Palavra) no primeiro capítulo de João?",
    options: [
      "Era um termo puramente militar romano para designar ordens do imperador.",
      "Para os gregos representava a razão cósmica que sustenta o universo, e para os judeus evocava a Palavra ativa de Deus na criação (Memra). João conecta ambos para apresentar Jesus como a revelação suprema.",
      "Significa simplesmente 'uma conversa comum' entre os apóstolos e Jesus.",
      "Era o nome de uma seita herética que João estava tentando converter em Éfeso."
    ],
    correctAnswer: "Para os gregos representava a razão cósmica que sustenta o universo, e para os judeus evocava a Palavra ativa de Deus na criação (Memra). João conecta ambos para apresentar Jesus como a revelação suprema.",
    explanation: "Ao usar 'Logos', João comunica tanto com a filosofia grega quanto com a tradição do Antigo Testamento, mostrando que Jesus é tanto a mente que ordena o cosmos quanto a própria Palavra viva e criadora do Deus de Israel.",
    suggestedReading: "João 1"
  },
  {
    id: "jo-1-q3",
    type: "multiple-choice",
    book: "João",
    chapter: 1,
    difficulty: "walking",
    question: "De acordo com João 1:14, o que aconteceu com o Verbo?",
    options: ["Ele permaneceu invisível no céu", "Ele se fez carne e habitou entre nós", "Ele transformou-se em um livro escrito", "Ele apareceu apenas como um espírito de luz"],
    correctAnswer: "Ele se fez carne e habitou entre nós",
    explanation: "João 1:14 expressa o milagre da Encarnação: 'E o Verbo se fez carne e habitou entre nós, e vimos a sua glória, glória como do unigênito do Pai, cheio de graça e de verdade.'",
    suggestedReading: "João 1"
  },

  // ── Questões Gerais (Foco Adaptativo e Temático) ─────────────────────────
  {
    id: "gen-q-m1",
    type: "matching",
    difficulty: "walking",
    question: "Relacione os seguintes personagens bíblicos marcantes com seus respectivos acontecimentos e provações:",
    matchingLeft: ["Moisés", "Daniel", "Jonas", "Noé"],
    matchingRight: ["Liderou o Êxodo e a travessia do Mar Vermelho", "Foi jogado na cova dos leões por orar a Deus", "Fugiu de Deus e foi engolido por um grande peixe", "Construiu a arca obedecendo ao mandado de Deus"],
    correctAnswer: "Moisés: Liderou o Êxodo, Daniel: Cova dos Leões, Jonas: Grande peixe, Noé: Construiu a arca",
    explanation: "Moisés liderou a libertação do Egito; Daniel foi poupado na cova dos leões na Pérsia; Jonas tentou fugir de ir a Nínive e foi tragado por um peixe; Noé construiu a arca para salvar sua família do dilúvio.",
    suggestedReading: "Hebreus 11"
  },
  {
    id: "gen-q-c1",
    type: "chronological",
    difficulty: "deepening",
    question: "Ordene cronologicamente os seguintes grandes acontecimentos da história bíblica (do mais antigo para o mais recente):",
    chronologicalItems: ["A Chamada de Abraão", "A Construção do Templo por Salomão", "O Cativeiro na Babilônia", "O Ministério de Jesus na Terra"],
    correctAnswer: "A Chamada de Abraão, A Construção do Templo por Salomão, O Cativeiro na Babilônia, O Ministério de Jesus na Terra",
    explanation: "Abraão viveu por volta de 2000 a.C. Salomão construiu o templo em c. 960 a.C. O cativeiro na Babilônia começou em 586 a.C. O ministério terreno de Jesus ocorreu no início do século I d.C.",
    suggestedReading: "Atos 7"
  },
  {
    id: "gen-q-who1",
    type: "multiple-choice",
    difficulty: "beginner",
    question: "Quem declarou a célebre frase: 'Eu e a minha casa serviremos ao Senhor'?",
    options: ["Davi", "Moisés", "Josué", "Samuel"],
    correctAnswer: "Josué",
    explanation: "Josué proferiu essas palavras no final da sua vida, ao reunir todas as tribos de Israel em Siquém, desafiando o povo a escolher a quem serviriam (Josué 24:15).",
    suggestedReading: "Josué 24"
  },
  {
    id: "gen-q-where1",
    type: "multiple-choice",
    difficulty: "beginner",
    question: "Em qual localidade da Judeia, conforme profetizado pelos profetas do Antigo Testamento, nasceu Jesus?",
    options: ["Nazaré", "Belém", "Jerusalém", "Jericó"],
    correctAnswer: "Belém",
    explanation: "Jesus nasceu em Belém da Judeia no tempo do rei Herodes, cumprindo a profecia de Miqueias 5:2 (conforme registrado em Mateus 2:1-6).",
    suggestedReading: "Mateus 2"
  }
];

// Helper: Get quiz for a specific chapter
export function getChapterQuiz(book: string, chapter: number, count: number = 3): BibleQuestion[] {
  // Try to find questions for this specific book and chapter
  const matches = BIBLE_QUESTIONS.filter(
    q => q.book?.toLowerCase() === book.toLowerCase() && q.chapter === chapter
  );

  if (matches.length >= count) {
    return matches.slice(0, count);
  }

  // If we don't have enough specific questions, fill up with thematic questions
  const fillers = BIBLE_QUESTIONS.filter(q => !q.book);
  const combined = [...matches, ...fillers];
  
  // If we still don't have enough, generate dynamic ones to avoid empty states
  while (combined.length < count) {
    const fakeId = `dyn-q-${book}-${chapter}-${combined.length}`;
    combined.push({
      id: fakeId,
      type: "multiple-choice",
      book,
      chapter,
      difficulty: "beginner",
      question: `[Estudo] De acordo com a leitura de ${book} ${chapter}, qual destas atitudes melhor expressa a fidelidade a Deus descrita no texto?`,
      options: [
        "A obediência fiel e a busca sincera por conhecer a Sua Palavra",
        "A busca por recompensas puramente materiais",
        "A indiferença perante os ensinamentos divinos",
        "O cumprimento mecânico de rituais sem conversão do coração"
      ],
      correctAnswer: "A obediência fiel e a busca sincera por conhecer a Sua Palavra",
      explanation: `Em todo o livro de ${book}, a Palavra de Deus nos chama a um relacionamento vivo de confiança, obediência de coração e amor sincero ao Criador.`,
      suggestedReading: `${book} ${chapter}`
    });
  }

  return combined.slice(0, count);
}

// Helper: Get adaptive quiz based on profile difficulty level
export function getAdaptiveQuiz(difficulty: "beginner" | "walking" | "deepening", count: number = 5): BibleQuestion[] {
  // Filter questions matching difficulty
  const matches = BIBLE_QUESTIONS.filter(q => q.difficulty === difficulty);
  
  if (matches.length >= count) {
    return matches.slice(0, count).sort(() => Math.random() - 0.5);
  }
  
  // If not enough, take a mix of all questions
  const all = [...BIBLE_QUESTIONS].sort(() => Math.random() - 0.5);
  return all.slice(0, count);
}

// Helper: Record individual answer status and update stats / simple achievements
export function recordAnswer(isCorrect: boolean): string[] {
  if (typeof window === "undefined") return [];
  
  // Track total questions answered
  const currentTotal = Number(localStorage.getItem("bible.stats.totalQuestionsCount") || "0");
  localStorage.setItem("bible.stats.totalQuestionsCount", String(currentTotal + 1));

  // Append entry to questionHistory
  try {
    const history = JSON.parse(localStorage.getItem("bible.stats.questionHistory") || "[]");
    history.push({
      date: new Date().toISOString(),
      isCorrect
    });
    localStorage.setItem("bible.stats.questionHistory", JSON.stringify(history));
  } catch (e) {}

  if (isCorrect) {
    const currentCorrect = Number(localStorage.getItem("bible.stats.correctAnswersCount") || "0");
    const newCorrect = currentCorrect + 1;
    localStorage.setItem("bible.stats.correctAnswersCount", String(newCorrect));
    
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
    }
    return newlyUnlocked;
  } else {
    return [];
  }
}

// Helper: Record quiz completion and check for specific chapter achievements
export function recordQuizCompletion(book: string, chapter: number, score: number, total: number): string[] {
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
    if (book.toLowerCase() === "gênesis" && chapter === 1 && !completed.includes("genesis_specialist")) {
      completed.push("genesis_specialist");
      newlyUnlocked.push("Especialista em Gênesis");
    }
    if (book.toLowerCase() === "joão" && chapter === 1 && !completed.includes("gospels_connoisseur")) {
      completed.push("gospels_connoisseur");
      newlyUnlocked.push("Conhecedor dos Evangelhos");
    }
  }

  if (newlyUnlocked.length > 0) {
    localStorage.setItem("bible.completedChallenges", JSON.stringify(completed));
  }
  return newlyUnlocked;
}

