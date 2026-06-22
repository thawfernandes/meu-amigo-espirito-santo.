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

// Versículos de exemplo enquanto a API não está configurada
export const SAMPLE_CHAPTER: Record<number, string> = {
  1: "No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus.",
  2: "Ele estava no princípio com Deus.",
  3: "Todas as coisas foram feitas por intermédio dele, e, sem ele, nada do que foi feito se fez.",
  4: "Nele estava a vida, e a vida era a luz dos homens.",
  5: "A luz resplandece nas trevas, e as trevas não a compreenderam.",
  6: "Houve um homem enviado por Deus, cujo nome era João.",
  7: "Este veio como testemunha, para que testificasse acerca da luz, a fim de todos crerem por meio dele.",
  8: "Ele não era a luz, mas veio para que testificasse acerca da luz.",
  9: "A luz verdadeira, que ilumina todo homem, estava vindo ao mundo.",
  10: "Ele estava no mundo, e o mundo foi feito por intermédio dele, mas o mundo não o reconheceu.",
  11: "Veio para o que era seu, mas os seus não o receberam.",
  12: "Mas, a todos quantos o receberam, deu-lhes o poder de serem feitos filhos de Deus, a saber, aos que creem no seu nome;",
  13: "os quais não nasceram do sangue, nem da vontade da carne, nem da vontade do varão, mas de Deus.",
  14: "E o Verbo se fez carne e habitou entre nós, e vimos a sua glória, glória como do unigênito do Pai, cheio de graça e de verdade.",
};
