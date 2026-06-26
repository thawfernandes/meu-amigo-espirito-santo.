export interface MonthlyChallenge {
  id: string;
  title: string;
  description: string;
  verseRef: string;
  verseText: string;
  objective: string;
  suggestions: string[];
  emoji: string;
}

const ALL_CHALLENGES: MonthlyChallenge[] = [
  {
    id: "pray_for_someone",
    title: "Ore por alguém durante sete dias consecutivos",
    description: "Dedique um momento diário para interceder especificamente por outra pessoa, fortalecendo a comunhão e o amor fraternal.",
    verseRef: "Tiago 5:16",
    verseText: "Confessem os seus pecados uns aos outros e orem uns pelos outros para serem curados. A oração de um justo é poderosa e eficaz.",
    objective: "Desenvolver uma vida de intercessão e lembrar que podemos carregar as necessidades de outras pessoas em oração.",
    emoji: "🙏",
    suggestions: [
      "Escolha um amigo, familiar ou colega de trabalho.",
      "Anote o nome dele e as necessidades específicas que você conhece.",
      "Separe um momento em suas orações diárias para clamar por essa pessoa."
    ]
  },
  {
    id: "act_of_kindness",
    title: "Pratique um ato de bondade sem esperar reconhecimento",
    description: "Faça algo de valor para alguém de forma discreta ou anônima, exercitando a generosidade pura.",
    verseRef: "Mateus 6:3-4",
    verseText: "Mas, quando você der esmola, que a sua mão esquerda não saiba o que está fazendo a direita, de forma que a sua esmola fique em segredo.",
    objective: "Incentivar a generosidade e o serviço sem buscar elogios ou recompensas humanas.",
    emoji: "❤️",
    suggestions: [
      "Deixe um bilhete carinhoso ou pague um café para um colega de forma anônima.",
      "Ajude a organizar ou limpar um espaço comum sem que ninguém saiba.",
      "Faça um favor a alguém sem mencionar que foi você quem fez."
    ]
  },
  {
    id: "help_someone_difficulty",
    title: "Ajude alguém que esteja passando por dificuldades",
    description: "Estenda a mão para quem precisa de apoio prático, emocional ou espiritual no seu círculo social.",
    verseRef: "Gálatas 6:2",
    verseText: "Levem os fardos uns dos outros e, assim, cumpram a lei de Cristo.",
    objective: "Colocar em prática o amor ao próximo por meio de atitudes concretas.",
    emoji: "🤝",
    suggestions: [
      "Prepare ou pague uma refeição para alguém que esteja sem tempo ou recursos.",
      "Separe 30 minutos para ouvir com empatia alguém que está desabafando.",
      "Auxilie fisicamente em alguma tarefa difícil, como uma mudança ou reparo doméstico."
    ]
  },
  {
    id: "elderly_care",
    title: "Demonstre cuidado por uma pessoa idosa",
    description: "Dedique tempo para honrar e apoiar alguém da terceira idade, valorizando sua sabedoria e presença.",
    verseRef: "Levítico 19:32",
    verseText: "Levantem-se na presença dos idosos, honrem os anciãos, temam o seu Deus. Eu sou o Senhor.",
    objective: "Incentivar o cuidado, o respeito e a valorização das pessoas mais velhas.",
    emoji: "👵",
    suggestions: [
      "Faça uma visita ou telefone para um parente idoso para saber como ele está.",
      "Ofereça-se para ajudar com as compras de supermercado ou tarefas que exijam esforço físico.",
      "Sente-se para conversar e ouvir com atenção as histórias de vida que eles têm para contar."
    ]
  },
  {
    id: "contribute_institution",
    title: "Contribua com alguma instituição ou projeto social",
    description: "Apoie ações que cuidam de crianças, órfãos ou pessoas em situação de extrema vulnerabilidade social.",
    verseRef: "Tiago 1:27",
    verseText: "A religião que Deus, nosso Pai, aceita como pura e impecável é esta: cuidar dos órfãos e das viúvas em suas dificuldades.",
    objective: "Lembrar e viver o cuidado prático com os necessitados e vulneráveis.",
    emoji: "👧",
    suggestions: [
      "Separe roupas, cobertores ou alimentos e leve a um abrigo ou paróquia local.",
      "Faça uma doação financeira para um projeto sério que atenda famílias carentes.",
      "Dedique um sábado ou algumas horas para participar voluntariamente de uma ação comunitária."
    ]
  },
  {
    id: "encouragement_message",
    title: "Envie uma mensagem de encorajamento para alguém",
    description: "Use o poder das palavras para trazer ânimo, fé e consolo à vida de um irmão.",
    verseRef: "1 Tessalonicenses 5:11",
    verseText: "Por isso, exortem-se e edifiquem-se uns aos outros, como de fato vocês estão fazendo.",
    objective: "Usar a comunicação e as palavras para fortalecer e edificar outras pessoas.",
    emoji: "💬",
    suggestions: [
      "Envie uma mensagem escrita à mão ou no WhatsApp ressaltando as qualidades de um amigo.",
      "Diga a um familiar que você valoriza a vida dele e que está orando por ele.",
      "Compartilhe uma passagem bíblica que traga esperança e paz ao coração da pessoa."
    ]
  },
  {
    id: "use_talent_serve",
    title: "Use um talento que Deus lhe deu para servir alguém",
    description: "Coloque suas habilidades (profissionais, artísticas ou manuais) à disposição do Reino e do próximo.",
    verseRef: "1 Pedro 4:10",
    verseText: "Cada um exerça o dom que recebeu para servir os outros, administrando fielmente a multiforme graça de Deus.",
    objective: "Incentivar o uso voluntário dos dons e talentos para abençoar a vida de outros.",
    emoji: "🎁",
    suggestions: [
      "Se você sabe ensinar, dê uma aula de reforço ou mentoria gratuita.",
      "Use talentos como cozinhar, desenhar, programar ou consertar para resolver um problema de alguém.",
      "Ofereça seus serviços profissionais gratuitamente para uma instituição beneficente."
    ]
  },
  {
    id: "thank_god",
    title: "Separe um momento para agradecer a Deus pelo que já recebeu",
    description: "Foque exclusivamente no louvor e agradecimento, cultivando um coração contente e reconhecido.",
    verseRef: "1 Tessalonicenses 5:18",
    verseText: "Deem graças em todas as circunstâncias, pois esta é a vontade de Deus para vocês em Cristo Jesus.",
    objective: "Desenvolver um espírito de contentamento e um coração mais grato pelas bênçãos diárias.",
    emoji: "🌱",
    suggestions: [
      "Escreva um diário ou uma lista com pelo menos 5 bênçãos recentes de Deus em sua vida.",
      "Faça um momento de oração focado apenas em adoração e ação de graças, sem fazer pedidos.",
      "Compartilhe com as pessoas na sua casa um livramento ou vitória recente."
    ]
  },
  {
    id: "share_verse_hope",
    title: "Compartilhe um versículo de esperança com alguém",
    description: "Seja um mensageiro da Palavra de Deus, transmitindo esperança a quem precisa de consolo.",
    verseRef: "Marcos 16:15",
    verseText: "E disse-lhes: 'Vão por todo o mundo e preguem o evangelho a toda criatura'.",
    objective: "Incentivar a partilha da Palavra de Deus de maneira natural, respeitosa e afetuosa.",
    emoji: "📖",
    suggestions: [
      "Escolha um versículo bíblico que tenha falado profundamente com você.",
      "Identifique um amigo ou conhecido que esteja passando por lutas ou angústia.",
      "Compartilhe o texto explicando brevemente como aquela verdade lhe trouxe consolo."
    ]
  }
];

export function getActiveChallengesForMonth(monthIndex: number): MonthlyChallenge[] {
  const rotation: Record<number, number[]> = {
    0: [0, 1, 2], // Jan
    1: [3, 4, 5], // Feb
    2: [6, 7, 8], // Mar
    3: [0, 3, 6], // Apr
    4: [1, 4, 7], // May
    5: [2, 5, 8], // Jun
    6: [0, 4, 8], // Jul
    7: [1, 5, 6], // Aug
    8: [2, 3, 7], // Sep
    9: [0, 5, 7], // Oct
    10: [1, 3, 8], // Nov
    11: [2, 4, 6], // Dec
  };

  const indices = rotation[monthIndex] || [0, 1, 2];
  return indices.map(idx => ALL_CHALLENGES[idx]);
}

export function getAllChallenges(): MonthlyChallenge[] {
  return ALL_CHALLENGES;
}
