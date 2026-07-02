/**
 * Tradução "Linguagem Próxima do Original"
 *
 * Este arquivo contém versículos traduzidos com máxima fidelidade
 * aos idiomas originais: hebraico (AT), aramaico e grego (NT).
 *
 * Princípios desta tradução:
 * - Preservar o significado literal das palavras originais
 * - Não adaptar ou suavizar o texto para fluidez em português
 * - Manter nomes divinos relevantes (YHWH, Elohim, Logos)
 * - Indicar palavras sem equivalente exato com nota entre colchetes
 * - Preferir construção menos natural porém mais fiel ao original
 *
 * Formato da estrutura:
 *   ORIGINAL_TRANSLATION[abbr][chapter][verse] = { text, notes? }
 *
 * Quando um versículo não possui tradução própria ainda,
 * a função getOriginalVerse() retorna null e o sistema
 * exibe a ACF com indicador visual "Em elaboração".
 */

export interface OriginalVerse {
  /** Texto traduzido fielmente ao original */
  text: string;
  /** Notas exegéticas opcionais (exibidas em tooltip no modo estudo) */
  notes?: string;
  /** Idioma original principal do versículo */
  originalLang?: "hebraico" | "grego" | "aramaico";
}

// ─── ESTRUTURA: abbr → capítulo → versículo ────────────────────────────
type OriginalMap = Record<string, Record<number, Record<number, OriginalVerse>>>;

export const ORIGINAL_TRANSLATION: OriginalMap = {

  // ══════════════════════════════════════════════════════════════════════
  // GÊNESIS
  // ══════════════════════════════════════════════════════════════════════
  gn: {
    1: {
      1: {
        text: "No princípio, Elohim criou os céus e a terra.",
        notes: "O hebraico 'בְּרֵאשִׁית' (bereshit) significa literalmente 'no princípio de'. 'Elohim' é o nome plural de majestade usado para Deus neste texto, distinto de YHWH. O verbo 'bara' (criou) é usado exclusivamente com Deus como sujeito no AT, indicando criação a partir do nada (ex nihilo).",
        originalLang: "hebraico"
      },
      2: {
        text: "A terra estava [sendo] vazia e sem forma, e as trevas [estavam] sobre a face do abismo profundo, e o Espírito de Elohim pairava sobre a face das águas.",
        notes: "O hebraico 'תֹהוּ וָבֹהוּ' (tohu va-vohu) indica caos, vazio e desorientação — não uma destruição, mas um estado pré-ordenado. O verbo 'merachefet' (pairava) é o mesmo usado em Dt 32:11 para a águia que paira sobre os filhotes — uma imagem de cuidado e vigilância ativa.",
        originalLang: "hebraico"
      },
      26: {
        text: "E disse Elohim: Façamos o ser humano [adam] à nossa imagem, conforme a nossa semelhança, e que tenha domínio sobre os peixes do mar e sobre as aves dos céus e sobre o animal [domesticado] e sobre toda a terra e sobre todo réptil que rasteja sobre a terra.",
        notes: "'Adam' (אָדָם) significa literalmente 'ser humano/terreno', derivado de 'adamah' (terra/solo). O plural 'Façamos' (na'aseh) tem sido interpretado como plural de majestade, referência à trindade ou ao conselho celestial. 'Imagem' (tzelem) e 'semelhança' (demuth) são termos distintos — tzelem sugere representação/ícone, demuth sugere padrão/modelo.",
        originalLang: "hebraico"
      }
    },
    4: {
      7: {
        text: "Se bem fizeres, não haverá elevação? E se não fizeres o bem, o pecado está agachado à porta, e para ti é o seu desejo, mas tu deves dominá-lo.",
        notes: "O hebraico 'rovetz' (רֹבֵץ) descreve um animal selvagem agachado, na posição de espreita antes do ataque — um leão ou predador aguardando o momento de saltar. Esta imagem é muito mais vívida e ameaçadora do que 'jaz à porta' das traduções tradicionais. O pecado é apresentado como um ser com agência e desejo predatório. 'Elevação' (se'et) é a mesma raiz do verbo 'levantar/elevar', indicando que fazer o bem eleva a posição do homem diante de Deus.",
        originalLang: "hebraico"
      }
    }
  },

  // ══════════════════════════════════════════════════════════════════════
  // SALMOS
  // ══════════════════════════════════════════════════════════════════════
  sl: {
    23: {
      1: {
        text: "O Senhor é meu pastor; não terei falta.",
        notes: "A construção hebraica 'lo echsar' (לֹא אֶחְסָר) é um imperfecto na primeira pessoa — 'não terei falta' ou 'não faltarei'. A ênfase não está em prosperidade material mas na suficiência total provida pela relação pastoral com o Senhor.",
        originalLang: "hebraico"
      },
      2: {
        text: "Em pastagens de [erva] tenra ele me faz deitar; sobre águas de repouso ele me guia.",
        notes: "'Niot deshe' (נְאוֹת דֶּשֶׁא) — pastagens de erva tenra/verde. 'Mei menuchot' (מֵי מְנֻחוֹת) — literalmente 'águas de repouso', podendo indicar água parada (ao contrário de correnteza perigosa para ovelhas) ou lugar de descanso espiritual.",
        originalLang: "hebraico"
      },
      3: {
        text: "Minha alma [nefesh] ele restaura; ele me guia por trilhos de justiça [tzedek] por causa do seu nome.",
        notes: "'Nefesh' (נֶפֶשׁ) é mais amplo que 'alma' — abrange vida, ser, anseio, garganta. Restaurar a nefesh é renovar a vida inteira. 'Tzedek' (justiça/retidão) indica os caminhos corretos, alinhados com o caráter de Deus — não apenas moralidade, mas ordenamento correto da realidade.",
        originalLang: "hebraico"
      },
      4: {
        text: "Mesmo se eu caminhar no vale de sombra de morte, não temerei o mal, pois tu estás comigo; teu cajado e teu bordão — eles me consolam.",
        notes: "'Gei tzalmavet' (גֵּיא צַלְמָוֶת) — literalmente 'vale da sombra-de-morte'. Tzalmavet combina 'tzelem' (sombra) e 'mavet' (morte), criando uma imagem de obscuridade mortal. O cajado (shebet) e o bordão (mishen) eram ferramentas do pastor — o cajado para controlar o rebanho e afastar predadores, o bordão como apoio e guia.",
        originalLang: "hebraico"
      },
      5: {
        text: "Tu preparas diante de mim uma mesa em frente aos meus adversários; ungiste minha cabeça com óleo; minha taça [está] transbordando.",
        notes: "A imagem muda de pastoral para real — Deus como anfitrião de um banquete de honra na presença dos inimigos. A unção com óleo era gesto de honra e distinção para hóspedes especiais. A taça transbordante sugere abundância que ultrapassa a capacidade de conter.",
        originalLang: "hebraico"
      },
      6: {
        text: "Seguramente bondade [tov] e misericórdia leal [chesed] me seguirão todos os dias da minha vida, e eu habitarei na casa de YHWH por dias longos [l'orek yamim].",
        notes: "'Chesed' (חֶסֶד) é um dos termos mais ricos do AT, frequentemente traduzido como 'misericórdia', 'amor leal', 'fidelidade amorosa' — descreve o amor comprometido de aliança. 'L'orek yamim' significa literalmente 'por extensão de dias' — pode indicar toda a vida terrena ou também a eternidade.",
        originalLang: "hebraico"
      }
    },
    119: {
      105: {
        text: "Tua palavra [dabar] é lâmpada para meus pés e luz para meu caminho.",
        notes: "'Dabar' (דָּבָר) é 'palavra' mas também 'coisa/realidade/evento' — a palavra de Deus não é apenas discurso mas realidade acontecida. A lâmpada ilumina apenas o próximo passo, não todo o caminho — sugere dependência contínua e caminhada de confiança passo a passo.",
        originalLang: "hebraico"
      }
    }
  },

  // ══════════════════════════════════════════════════════════════════════
  // PROVÉRBIOS
  // ══════════════════════════════════════════════════════════════════════
  pv: {
    3: {
      5: {
        text: "Confia em YHWH com todo o teu coração [lev], e não te apoies em tua própria inteligência [binah].",
        notes: "'Lev' (לֵב) em hebraico é o centro da pessoa — inteligência, vontade, emoções e caráter — não apenas sentimento. 'Binah' é discernimento/compreensão racional. O chamado é abandonar a autossuficiência intelectual e confiar totalmente em YHWH como centro da existência.",
        originalLang: "hebraico"
      },
      6: {
        text: "Em todos os teus caminhos reconhece-o, e ele endireitará tuas veredas.",
        notes: "'Yashár' (יָשַׁר) significa 'tornar reto, direto, alinhado'. O compromisso de reconhecer (da'at — conhecimento de relação íntima) a Deus em cada aspecto da vida resulta em Deus mesmo alinhando os caminhos do crente.",
        originalLang: "hebraico"
      }
    }
  },

  // ══════════════════════════════════════════════════════════════════════
  // ISAÍAS
  // ══════════════════════════════════════════════════════════════════════
  is: {
    40: {
      31: {
        text: "Mas os que esperam [kavah] em YHWH renovarão [yachalifú] sua força; subirão com asas como águias; correrão e não se cansarão; caminharão e não se fatigarão.",
        notes: "'Kavah' (קָוָה) não é apenas 'esperar passivamente' — é esperar com expectativa tensa, como uma corda esticada que anseia por ser liberada. 'Yachalifú' (renovarão) vem de 'chalaph' — que pode significar 'trocar, renovar, brotar novamente' como planta que brota após o inverno. A imagem é de força que é substituída, não apenas recarregada.",
        originalLang: "hebraico"
      }
    },
    53: {
      5: {
        text: "Mas ele foi perfurado [chalal] por causa de nossas transgressões [pesha], esmagado [dakah] por causa de nossas iniquidades [avon]; o castigo da nossa paz [shalom] estava sobre ele, e pela sua ferida [chaburah] temos cura [rapha].",
        notes: "'Chalal' (חָלַל) descreve ser atravessado, profanado — uma ferida que penetra. 'Pesha' são transgressões — rebeliões deliberadas contra Deus. 'Avon' é iniquidade — desvio moral. 'Shalom' é completude, bem-estar integral. 'Chaburah' é a marca do açoite. A substituição vicária é apresentada com precisão cirúrgica no hebraico.",
        originalLang: "hebraico"
      }
    }
  },

  // ══════════════════════════════════════════════════════════════════════
  // JOÃO
  // ══════════════════════════════════════════════════════════════════════
  jo: {
    1: {
      1: {
        text: "No princípio era o Logos, e o Logos estava voltado para Deus [pros ton Theon], e Deus era o Logos.",
        notes: "O grego 'Logos' (Λόγος) é preservado aqui pois não tem equivalente exato — abrange palavra, razão, princípio ordenador, expressão, discurso. A preposição 'pros' (πρός) indica não apenas 'com' mas 'voltado para, em direção a' — uma relação dinâmica e orientada, não estática. A construção 'kai Theos ên ho Logos' coloca 'Theos' sem artigo (predicativo) — Deus era o Logos em sua natureza, mas não no sentido de ser idêntico ao Pai.",
        originalLang: "grego"
      },
      14: {
        text: "E o Logos se fez carne e armou sua tenda [eskenoosen] entre nós, e contemplamos a glória dele, glória como [a] de unigênito junto ao pai, cheio de graça e de verdade.",
        notes: "'Eskenoosen' (ἐσκήνωσεν) — literalmente 'armou sua tenda, tabernaculou'. A mesma raiz de 'shekinah' hebraico — a presença habitante de Deus. João conecta a encarnação do Logos ao tabernáculo/tenda do AT onde Deus habitava no meio de Israel. 'Monogenes' (unigênito) indica filho único, o único na sua classe, inigualável.",
        originalLang: "grego"
      }
    },
    3: {
      16: {
        text: "Porque assim amou Deus o mundo [kosmos], de tal forma que deu o Filho, o Unigênito, a fim de que todo o que crê nele não pereça, mas tenha vida eterna.",
        notes: "O grego 'houtos gar egapesen' (οὕτως γὰρ ἠγάπησεν) indica a qualidade e extensão do amor — 'desta forma' ou 'de tal intensidade'. 'Kosmos' (κόσμος) é o mundo ordenado, a humanidade em sua totalidade. O verbo 'pisteuo' (crê) no particípio presente indica fé contínua e persistente, não um ato pontual. 'Zoen aionion' — vida do éon vindouro, vida da era de Deus.",
        originalLang: "grego"
      }
    },
    14: {
      6: {
        text: "Disse a ele Jesus: Eu sou o caminho e a verdade e a vida; ninguém vem ao Pai senão por mim.",
        notes: "O grego usa o artigo definido antes de cada substantivo: 'ho hodos kai he aletheia kai he zoe' — 'o caminho... a verdade... a vida' — absolutos e exclusivos. O 'Ego eimi' (Eu sou) ecoa o nome divino revelado em Êx 3:14 (LXX: 'ego eimi ho on'). Jesus não apresenta um caminho, mas se identifica como O caminho.",
        originalLang: "grego"
      }
    }
  },

  // ══════════════════════════════════════════════════════════════════════
  // ROMANOS
  // ══════════════════════════════════════════════════════════════════════
  rm: {
    8: {
      28: {
        text: "E sabemos que todas as coisas cooperam para o bem daqueles que amam a Deus, daqueles que são chamados [kletois] de acordo com um propósito [prothesis].",
        notes: "'Synergei' (συνεργεῖ) — trabalham juntas, cooperam. Não que todas as coisas sejam boas, mas que Deus as faz trabalhar em conjunto para produzir bem. 'Kletois' são os chamados — não automáticos, mas aqueles que respondem ao chamado de Deus. 'Prothesis' é propósito deliberado, plano estabelecido de antemão — a soberania de Deus não é reativa mas intencional.",
        originalLang: "grego"
      }
    }
  },

  // ══════════════════════════════════════════════════════════════════════
  // FILIPENSES
  // ══════════════════════════════════════════════════════════════════════
  fp: {
    4: {
      13: {
        text: "Tudo consigo [fortalecido] pelo que me fortalece [en to endunamounti me].",
        notes: "O versículo não afirma capacidade ilimitada de realizar qualquer coisa. O contexto imediato (vv. 11-12) é Paulo falando de aprender a ser contente tanto na abundância quanto na necessidade. 'En to endunamounti me' — literalmente 'no que me fortalece' — Paulo age dentro da força que Cristo provê, não por força própria expandida. A força é relacional e contextual.",
        originalLang: "grego"
      }
    }
  },

  // ══════════════════════════════════════════════════════════════════════
  // HEBREUS
  // ══════════════════════════════════════════════════════════════════════
  hb: {
    11: {
      1: {
        text: "Ora, a fé é a substância [hypostasis] das coisas esperadas, a prova [elegchos] de realidades não vistas.",
        notes: "'Hypostasis' (ὑπόστασις) é um termo filosófico grego que significa substância, fundamento, base real de algo — não uma crença subjetiva, mas uma base objetiva de realidade. 'Elegchos' (ἔλεγχος) é prova, evidência, argumento conclusivo — fé não é ausência de evidência, mas convicção baseada na realidade de Deus que não é visível aos olhos físicos.",
        originalLang: "grego"
      }
    }
  },

  // ══════════════════════════════════════════════════════════════════════
  // APOCALIPSE
  // ══════════════════════════════════════════════════════════════════════
  ap: {
    1: {
      8: {
        text: "Eu sou o Alfa e o Ômega, diz o Senhor Deus, o que é e o que era e o que vem [ho erchomenos], o Todo-Poderoso [Pantokrator].",
        notes: "'Ho erchomenos' (ὁ ἐρχόμενος) — literalmente 'o vindo', participio presente — não 'que virá' mas 'que está vindo' — indicando movimento contínuo em direção à consumação. 'Pantokrator' (Παντοκράτωρ) — aquele que segura tudo, que governa todo o cosmos. Muito mais abrangente que 'Todo-Poderoso' — é soberania ativa e sustentadora.",
        originalLang: "grego"
      }
    }
  }
};

// ─── FUNÇÕES DE ACESSO ────────────────────────────────────────────────

/**
 * Retorna a tradução literal do versículo se disponível.
 * @returns OriginalVerse ou null se não houver tradução própria ainda
 */
export function getOriginalVerse(
  bookAbbr: string,
  chapter: number,
  verse: number
): OriginalVerse | null {
  const bookData = ORIGINAL_TRANSLATION[bookAbbr.toLowerCase()];
  if (!bookData) return null;
  const chapterData = bookData[chapter];
  if (!chapterData) return null;
  return chapterData[verse] || null;
}

/**
 * Verifica se existe tradução literal para um capítulo inteiro
 */
export function hasOriginalChapter(bookAbbr: string, chapter: number): boolean {
  const bookData = ORIGINAL_TRANSLATION[bookAbbr.toLowerCase()];
  if (!bookData) return false;
  return !!bookData[chapter];
}

/**
 * Retorna todos os versículos disponíveis de um capítulo específico
 */
export function getOriginalChapterVerses(
  bookAbbr: string,
  chapter: number
): Record<number, OriginalVerse> | null {
  const bookData = ORIGINAL_TRANSLATION[bookAbbr.toLowerCase()];
  if (!bookData) return null;
  return bookData[chapter] || null;
}

/**
 * Lista todos os livros que possuem ao menos um versículo traduzido
 */
export function getBooksWithOriginalVerses(): string[] {
  return Object.keys(ORIGINAL_TRANSLATION);
}

/**
 * Conta o total de versículos com tradução literal disponível
 */
export function countOriginalVerses(): number {
  let count = 0;
  for (const book of Object.values(ORIGINAL_TRANSLATION)) {
    for (const chapter of Object.values(book)) {
      count += Object.keys(chapter).length;
    }
  }
  return count;
}
