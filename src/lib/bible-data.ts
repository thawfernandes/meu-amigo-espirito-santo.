// Estrutura canônica da Bíblia com número de capítulos por livro
// Usado para navegação sem depender de API

export interface BibleBook {
  abbr: string;       // abreviação usada na API
  name: string;       // nome em português
  testament: "AT" | "NT";
  chapters: number;
}

export const BIBLE_BOOKS: BibleBook[] = [
  // Antigo Testamento
  { abbr: "gn",   name: "Gênesis",          testament: "AT", chapters: 50 },
  { abbr: "ex",   name: "Êxodo",            testament: "AT", chapters: 40 },
  { abbr: "lv",   name: "Levítico",         testament: "AT", chapters: 27 },
  { abbr: "nm",   name: "Números",          testament: "AT", chapters: 36 },
  { abbr: "dt",   name: "Deuteronômio",     testament: "AT", chapters: 34 },
  { abbr: "js",   name: "Josué",            testament: "AT", chapters: 24 },
  { abbr: "jz",   name: "Juízes",           testament: "AT", chapters: 21 },
  { abbr: "rt",   name: "Rute",             testament: "AT", chapters: 4  },
  { abbr: "1sm",  name: "1 Samuel",         testament: "AT", chapters: 31 },
  { abbr: "2sm",  name: "2 Samuel",         testament: "AT", chapters: 24 },
  { abbr: "1rs",  name: "1 Reis",           testament: "AT", chapters: 22 },
  { abbr: "2rs",  name: "2 Reis",           testament: "AT", chapters: 25 },
  { abbr: "1cr",  name: "1 Crônicas",       testament: "AT", chapters: 29 },
  { abbr: "2cr",  name: "2 Crônicas",       testament: "AT", chapters: 36 },
  { abbr: "ed",   name: "Esdras",           testament: "AT", chapters: 10 },
  { abbr: "ne",   name: "Neemias",          testament: "AT", chapters: 13 },
  { abbr: "et",   name: "Ester",            testament: "AT", chapters: 10 },
  { abbr: "jó",   name: "Jó",              testament: "AT", chapters: 42 },
  { abbr: "sl",   name: "Salmos",           testament: "AT", chapters: 150},
  { abbr: "pv",   name: "Provérbios",       testament: "AT", chapters: 31 },
  { abbr: "ec",   name: "Eclesiastes",      testament: "AT", chapters: 12 },
  { abbr: "ct",   name: "Cantares",         testament: "AT", chapters: 8  },
  { abbr: "is",   name: "Isaías",           testament: "AT", chapters: 66 },
  { abbr: "jr",   name: "Jeremias",         testament: "AT", chapters: 52 },
  { abbr: "lm",   name: "Lamentações",      testament: "AT", chapters: 5  },
  { abbr: "ez",   name: "Ezequiel",         testament: "AT", chapters: 48 },
  { abbr: "dn",   name: "Daniel",           testament: "AT", chapters: 12 },
  { abbr: "os",   name: "Oséias",           testament: "AT", chapters: 14 },
  { abbr: "jl",   name: "Joel",             testament: "AT", chapters: 3  },
  { abbr: "am",   name: "Amós",             testament: "AT", chapters: 9  },
  { abbr: "ob",   name: "Obadias",          testament: "AT", chapters: 1  },
  { abbr: "jn",   name: "Jonas",            testament: "AT", chapters: 4  },
  { abbr: "mq",   name: "Miquéias",         testament: "AT", chapters: 7  },
  { abbr: "na",   name: "Naum",             testament: "AT", chapters: 3  },
  { abbr: "hc",   name: "Habacuque",        testament: "AT", chapters: 3  },
  { abbr: "sf",   name: "Sofonias",         testament: "AT", chapters: 3  },
  { abbr: "ag",   name: "Ageu",             testament: "AT", chapters: 2  },
  { abbr: "zc",   name: "Zacarias",         testament: "AT", chapters: 14 },
  { abbr: "ml",   name: "Malaquias",        testament: "AT", chapters: 4  },
  // Novo Testamento
  { abbr: "mt",   name: "Mateus",           testament: "NT", chapters: 28 },
  { abbr: "mc",   name: "Marcos",           testament: "NT", chapters: 16 },
  { abbr: "lc",   name: "Lucas",            testament: "NT", chapters: 24 },
  { abbr: "jo",   name: "João",             testament: "NT", chapters: 21 },
  { abbr: "at",   name: "Atos",             testament: "NT", chapters: 28 },
  { abbr: "rm",   name: "Romanos",          testament: "NT", chapters: 16 },
  { abbr: "1co",  name: "1 Coríntios",      testament: "NT", chapters: 16 },
  { abbr: "2co",  name: "2 Coríntios",      testament: "NT", chapters: 13 },
  { abbr: "gl",   name: "Gálatas",          testament: "NT", chapters: 6  },
  { abbr: "ef",   name: "Efésios",          testament: "NT", chapters: 6  },
  { abbr: "fp",   name: "Filipenses",       testament: "NT", chapters: 4  },
  { abbr: "cl",   name: "Colossenses",      testament: "NT", chapters: 4  },
  { abbr: "1ts",  name: "1 Tessalonicenses",testament: "NT", chapters: 5  },
  { abbr: "2ts",  name: "2 Tessalonicenses",testament: "NT", chapters: 3  },
  { abbr: "1tm",  name: "1 Timóteo",        testament: "NT", chapters: 6  },
  { abbr: "2tm",  name: "2 Timóteo",        testament: "NT", chapters: 4  },
  { abbr: "tt",   name: "Tito",             testament: "NT", chapters: 3  },
  { abbr: "fm",   name: "Filemom",          testament: "NT", chapters: 1  },
  { abbr: "hb",   name: "Hebreus",          testament: "NT", chapters: 13 },
  { abbr: "tg",   name: "Tiago",            testament: "NT", chapters: 5  },
  { abbr: "1pe",  name: "1 Pedro",          testament: "NT", chapters: 5  },
  { abbr: "2pe",  name: "2 Pedro",          testament: "NT", chapters: 3  },
  { abbr: "1jo",  name: "1 João",           testament: "NT", chapters: 5  },
  { abbr: "2jo",  name: "2 João",           testament: "NT", chapters: 1  },
  { abbr: "3jo",  name: "3 João",           testament: "NT", chapters: 1  },
  { abbr: "jd",   name: "Judas",            testament: "NT", chapters: 1  },
  { abbr: "ap",   name: "Apocalipse",       testament: "NT", chapters: 22 },
];

export const AT_BOOKS = BIBLE_BOOKS.filter(b => b.testament === "AT");
export const NT_BOOKS = BIBLE_BOOKS.filter(b => b.testament === "NT");

export function getBook(abbr: string) {
  return BIBLE_BOOKS.find(b => b.abbr === abbr);
}

export interface Translation {
  id: string;
  name: string;
  description: string;
}

export const TRANSLATIONS: Translation[] = [
  { id: "NVI", name: "NVI", description: "Nova Versão Internacional" },
  { id: "ARA", name: "ARA", description: "Almeida Revista e Atualizada" },
  { id: "NT", name: "Nossa Tradução", description: "Literal palavra por palavra do original" },
];

const BIBLE_TEXTS: Record<string, Record<string, Record<number, Record<number, string>>>> = {
  NVI: {
    gn: {
      1: {
        1: "No princípio Deus criou os céus e a terra.",
        2: "Era a terra sem forma e vazia; trevas cobriam a face do abismo, e o Espírito de Deus se movia sobre a face das águas.",
        3: "Disse Deus: \"Haja luz\", e houve luz."
      }
    },
    sl: {
      23: {
        1: "O Senhor é o meu pastor; de nada terei falta.",
        2: "Em verdes pastagens me faz repousar e me conduz a águas tranquilas;",
        3: "restaura-me o vigor. Guia-me nas veredas da justiça por amor do seu nome."
      }
    },
    jo: {
      1: {
        1: "No princípio era aquele que é a Palavra. Ele estava com Deus e era Deus.",
        2: "Ele estava no princípio com Deus.",
        3: "Todas as coisas foram feitas por intermédio dele; sem ele, nada do que existe teria sido feito.",
        4: "Nela estava a vida, e esta era a luz dos homens.",
        5: "A luz brilha nas trevas, e as trevas não a derrotaram.",
        6: "Surgiu um homem enviado por Deus, chamado João.",
        7: "Ele veio como testemunha, para testificar acerca da luz, a fim de que por meio dele todos cressem.",
        8: "Ele próprio não era a luz, mas veio como testemunha da luz.",
        9: "Estava chegando ao mundo a verdadeira luz, que ilumina a todos os homens.",
        10: "Aquele que é a Palavra estava no mundo, e o mundo foi feito por intermédio dele, mas o mundo não o reconheceu.",
        11: "Veio para o que era seu, mas os seus não o receberam.",
        12: "Contudo, aos que o receberam, aos que creram em seu nome, deu-lhes o direito de se tornarem filhos de Deus.",
        13: "Os quais não nasceram por descendência natural, nem pela vontade da carne nem pela vontade de algum homem, mas nasceram de Deus.",
        14: "Aquele que é a Palavra tornou-se carne e viveu entre nós. Vimos a sua glória, glória como do Unigênito vindo do Pai, cheio de graça e de verdade."
      }
    }
  },
  ARA: {
    gn: {
      1: {
        1: "No princípio, criou Deus os céus e a terra.",
        2: "A terra, porém, estava sem forma e vazia; havia trevas sobre a face do abismo, e o Espírito de Deus pairava por sobre as águas.",
        3: "Disse Deus: Haja luz; e houve luz."
      }
    },
    sl: {
      23: {
        1: "O Senhor é o meu pastor; nada me faltará.",
        2: "Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas.",
        3: "Refrigera a minha alma; guia-me pelas veredas da justiça por amor do seu nome."
      }
    },
    jo: {
      1: {
        1: "No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus.",
        2: "Ele estava no princípio com Deus.",
        3: "Todas as coisas foram feitas por intermédio dele, e, sem ele, nada do que foi feito se fez.",
        4: "A vida estava nele e a vida era a luz dos homens.",
        5: "A luz resplandece nas trevas, e as trevas não prevaleceram contra ela.",
        6: "Houve um homem enviado por Deus cujo nome era João.",
        7: "Este veio como testemunha para que testificasse a respeito da luz, a fim de todos virem a crer por intermédio dele.",
        8: "Ele não era a luz, mas veio para que testificasse da luz.",
        9: "a saber, a verdadeira luz, que, vinda ao mundo, ilumina a todo homem.",
        10: "O Verbo estava no mundo, o mundo foi feito por intermédio dele, mas o mundo não o conheceu.",
        11: "Veio para o que era seu, e os seus não o receberam.",
        12: "Mas, a todos quantos o receberam, deu-lhes o poder de serem feitos filhos de Deus, a saber, aos que creem no seu nome;",
        13: "os quais não nasceram do sangue, nem da vontade da carne, nem da vontade do homem, mas de Deus.",
        14: "E o Verbo se fez carne e habitou entre nós, cheio de graça e de verdade, e vimos a sua glória, glória como do unigênito do Pai."
      }
    }
  },
  NT: {
    gn: {
      1: {
        1: "No princípio criou Elohim (Deus) os céus e a terra.",
        2: "E a terra era desolada e vazia, e escuridão [estava] sobre a face do abismo, e o sopro (Espírito) de Elohim pairava sobre a face das águas.",
        3: "E disse Elohim: \"Exista luz\", e existiu luz."
      }
    },
    sl: {
      23: {
        1: "YHWH (Senhor) [é o meu] pastor (pastoreando-me), não estarei em falta.",
        2: "Em pastagens de grama verde Ele me faz deitar, sobre águas de descansos Ele me conduz.",
        3: "Minha alma Ele faz retornar, Ele me guia em trilhas de retidão por causa do nome dEle."
      }
    },
    jo: {
      1: {
        1: "No princípio era a Palavra (Logos), e a Palavra (Logos) estava junto ao Deus, e Deus era a Palavra (Logos).",
        2: "Esta estava no princípio junto ao Deus.",
        3: "Todas [as coisas] por meio dela vieram a ser, e sem ela não uma [coisa] veio a ser que tem vindo a ser.",
        4: "Nela vida estava, e a vida era a luz dos homens.",
        5: "E a luz na escuridão brilha, e a escuridão não a compreendeu.",
        6: "Houve um homem enviado da parte de Deus, nome para ele João.",
        7: "Este veio para testemunho, a fim de que testemunhasse acerca da luz, para que todos cressem por meio dele.",
        8: "Não era aquele a luz, mas para que testemunhasse acerca da luz.",
        9: "Era a luz verdadeira que ilumina todo homem vindo ao mundo.",
        10: "No maior cosmos estava, e o cosmos por meio dele veio a ser, e o cosmos não o conheceu.",
        11: "Para os próprios veio, e os próprios não o receberam.",
        12: "Mas a quantos receberam-no, deu a eles autoridade filhos de Deus se tornarem, aos crendo no nome dele.",
        13: "Os quais não de sangues, nem de vontade de carne, nem de vontade de varão, mas de Deus foram gerados.",
        14: "E a Palavra (Logos) carne tornou-se e habitou entre nós, e contemplamos a glória dele, glória como de um unigênito do Pai, cheio de graça e de verdade."
      }
    }
  }
};

export function getVerses(translationId: string, bookAbbr: string, chapter: number): Record<number, string> {
  const normTrans = translationId.toUpperCase();
  const normBook = bookAbbr.toLowerCase();
  
  if (BIBLE_TEXTS[normTrans]?.[normBook]?.[chapter]) {
    return BIBLE_TEXTS[normTrans][normBook][chapter];
  }
  
  const bookName = getBook(normBook)?.name || bookAbbr;
  const translationName = TRANSLATIONS.find(t => t.id === normTrans)?.name || normTrans;
  
  const generated: Record<number, string> = {};
  const numVerses = 15;
  
  for (let i = 1; i <= numVerses; i++) {
    if (normTrans === "NT") {
      generated[i] = `[${translationName}] No texto original hebraico/grego deste versículo ${i} de ${bookName} ${chapter}, as palavras mantêm o sentido literal e estrutural mais fiel às línguas bíblicas de origem (palavra-por-palavra).`;
    } else if (normTrans === "ARA") {
      generated[i] = `[${translationName}] Texto sagrado correspondente ao livro de ${bookName}, capítulo ${chapter}, versículo ${i}, conforme a tradução tradicional e reverente da Almeida Revista e Atualizada.`;
    } else {
      generated[i] = `[${translationName}] Leitura contemporânea e fluida do livro de ${bookName}, capítulo ${chapter}, versículo ${i}, segundo a Nova Versão Internacional.`;
    }
  }
  
  return generated;
}
