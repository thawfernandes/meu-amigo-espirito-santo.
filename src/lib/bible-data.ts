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
  { id: "ORIGINAL", name: "Linguagem Próxima do Original", description: "Tradução literal dos textos originais" },
  { id: "NVI", name: "NVI", description: "Nova Versão Internacional" },
  { id: "ARA", name: "ARA", description: "Almeida Revista e Atualizada" },
  { id: "ACF", name: "ACF", description: "Almeida Corrigida Fiel" },
  { id: "AA", name: "AA", description: "Almeida Atualizada" },
  { id: "AVE", name: "Ave Maria", description: "Tradução Católica" },
];

const BIBLE_TEXTS: Record<string, Record<string, Record<number, Record<number, string>>>> = {
  AVE: {
    gn: {
      1: {
        "1": "No princípio, Deus criou o céu e a terra.",
        "2": "A terra, porém, estava informe e vazia, e as trevas cobriam a face do abismo, e o Espírito de Deus movia-se sobre as águas.",
        "3": "E Deus disse: «Faça-se a luz!» E a luz foi feita.",
        "4": "Deus viu que a luz era boa, e separou a luz das trevas.",
        "5": "Deus chamou à luz dia, e às trevas noite. Sobreveio a tarde e depois a manhã: foi o primeiro dia.",
        "6": "Deus disse: «Haja um firmamento no meio das águas, que separe umas águas das outras».",
        "7": "E Deus fez o firmamento; e separou as águas que estavam debaixo do firmamento das que estavam por cima dele. E assim se fez.",
        "8": "Deus chamou ao firmamento céu. Sobreveio a tarde e depois a manhã: foi o segundo dia.",
        "9": "Deus disse: «As águas que estão debaixo dos céus ajuntem-se num só lugar e apareça o elemento árido». E assim se fez.",
        "10": "Deus chamou ao elemento árido terra e ao ajuntamento das águas mares. E Deus viu que isto era bom.",
        "11": "Deus disse: «Produza a terra plantas, ervas que deem semente, e árvores frutíferas que deem sobre a terra fruto segundo a sua espécie, e que tenham a sua semente em si mesmas». E assim se fez.",
        "12": "A terra produziu plantas, ervas que dão semente segundo a sua espécie, e árvores que dão fruto e que têm em si a sua semente, segundo a sua espécie. E Deus viu que isto era bom.",
        "13": "Sobreveio a tarde e depois a manhã: foi o terceiro dia.",
        "14": "Deus disse: «Haja luminares no firmamento do céu, para separar o dia da noite; que eles sirvam de sinais, tanto para as estações como para os dias e para os anos,",
        "15": "e que luza, no firmamento do céu, para iluminar a terra». E assim se fez.",
        "16": "Deus fez os dois grandes luminares: o luminar maior para presidir ao dia, e o luminar menor para presidir à noite; e fez as estrelas.",
        "17": "Deus colocou-os no firmamento do céu para que iluminassem a terra,",
        "18": "presidissem ao dia e à noite e separassem a luz das trevas. E Deus viu que isto era bom.",
        "19": "Sobreveio a tarde e depois a manhã: foi o quarto dia.",
        "20": "Deus disse: «As águas produzam uma multidão de seres vivos, e aves voem sobre a terra, no firmamento do céu».",
        "21": "Deus criou os grandes monstros marinhos e todos os seres vivos que se movem e que povoam as águas, segundo a sua espécie; e todas as aves aladas, segundo a sua espécie. E Deus viu que isto era bom.",
        "22": "Deus abençoou-os, dizendo: «Crescei e multiplicai-vos, e enchei as águas do mar; e que as aves se multiplem sobre a terra».",
        "23": "Sobreveio a tarde e depois a manhã: foi o quinto dia.",
        "24": "Deus disse: «Produza a terra seres vivos segundo a sua espécie: animais domésticos, répteis e animais selvagens da terra, segundo a sua espécie». E assim se fez.",
        "25": "Deus fez os animais selvagens da terra segundo a sua espécie, os animais domésticos segundo a sua espécie, e todos os répteis da terra segundo a sua espécie. E Deus viu que isto era bom.",
        "26": "Deus disse: «Façamos o homem à nossa imagem e semelhança; que ele domine sobre os peixes do mar, sobre as aves do céu, sobre os animais domésticos, sobre todos os animais selvagens e sobre todos os répteis que andam pelo chão».",
        "27": "Deus criou o homem à sua imagem, criou-o à imagem de Deus; criou-os homem e mulher.",
        "28": "Deus abençoou-os e disse-lhes: «Crescei e multiplicai-vos, enchei a terra e submetei-a; dominai sobre os peixes do mar, sobre as aves do céu e sobre todos os animais que se movem sobre a terra».",
        "29": "E Deus disse: «Eis que vos dou todas as ervas que dão semente, que existem em toda a superfície da terra, e todas as árvores em que há frutos que dão semente; isto vos servirá de alimento.",
        "30": "A todos os animais da terra, a todas as aves do céu e a tudo o que se move sobre a terra, em que há fôlego de vida, dou-lhes por alimento todas as ervas verdes». E assim se fez.",
        "31": "Deus viu tudo o que tinha feito: e era muito bom. Sobreveio a tarde e depois a manhã: foi o sexto dia.",
      }
    },
    sl: {
      23: {
        "1": "O Senhor é o meu pastor: nada me falta.",
        "2": "Ele me faz repousar em pastagens verdejantes. Conduz-me para junto das águas de repouso;",
        "3": "Ele restaura a minha alma; guia-me pelas veredas da justiça, por amor do seu nome.",
      }
    },
    jo: {
      1: {
        "1": "No princípio era o Verbo, e o Verbo estava junto de Deus, e o Verbo era Deus.",
        "2": "Ele estava no princípio junto de Deus.",
        "3": "Tudo foi feito por Ele, e sem Ele nada foi feito.",
        "4": "N'Ele estava a vida, e a vida era a luz dos homens.",
        "5": "E a luz resplandece nas trevas, mas as trevas não a compreenderam.",
        "6": "Houve um homem enviado por Deus, que se chamava João.",
        "7": "Este veio como testemunha, para dar testemunho da luz, a fim de que todos cressem por meio dele.",
        "8": "Ele não era a luz, mas vinha para dar testemunho da luz.",
        "9": "O Verbo era a luz verdadeira, que, vindo ao mundo, ilumina todo o homem.",
        "10": "Ele estava no mundo, e o mundo foi feito por Ele, mas o mundo não O conheceu.",
        "11": "Veio para o que era seu, mas os seus não O receberam.",
        "12": "Mas, a todos quantos O receberam, àqueles que creem no seu nome, deu-lhes o poder de se tornarem filhos de Deus;",
        "13": "os quais não nasceram do sangue, nem da vontade da carne, nem da vontade do homem, mas de Deus.",
        "14": "E o Verbo fez-se carne, e habitou entre nós; e nós vimos a sua glória, glória que Lhe vem do Pai como Filho unigênito, cheio de graça e de verdade.",
      }
    }
  },
  NVI: {
    gn: {
      1: {
        "1": "No princípio Deus criou os céus e a terra.",
        "2": "Era a terra sem forma e vazia; trevas cobriam a face do abismo, e o Espírito de Deus se movia sobre a face das águas.",
        "3": "Disse Deus: \"Haja luz\", e houve luz.",
        "4": "Deus viu que a luz era boa, e separou a luz das trevas.",
        "5": "Deus chamou à luz dia, e às trevas chamou noite. Passaram-se a tarde e a manhã; esse foi o primeiro dia.",
        "6": "Depois disse Deus: \"Haja entre as águas um firmamento que separe águas de águas\".",
        "7": "Então Deus fez o firmamento e separou as águas que ficaram abaixo do firmamento das que ficaram por cima. E assim foi.",
        "8": "Ao firmamento Deus chamou céu. Passaram-se a tarde e a manhã; esse foi o segundo dia.",
        "9": "E disse Deus: \"Ajuntem-se num só lugar as águas que estão debaixo do céu, e apareça a parte seca\". E assim foi.",
        "10": "À parte seca Deus chamou terra, e ao ajuntamento das águas chamou mares. E Deus viu que ficou bom.",
        "11": "Então disse Deus: \"Cubra-se a terra de vegetação: plantas que deem sementes e árvores cujos frutos produzam sementes de acordo com as suas espécies\". E assim foi.",
        "12": "A terra fez brotar a vegetação: plantas que dão sementes de acordo com as suas espécies, e árvores cujos frutos produzem sementes de acordo com as suas espécies. E Deus viu que ficou bom.",
        "13": "Passaram-se a tarde e a manhã; esse foi o terceiro dia.",
        "14": "Disse Deus: \"Haja luminares no firmamento do céu para separar o dia da noite. Sirvam eles de sinais para marcar estações, dias e anos,",
        "15": "e sirvam de luminares no firmamento do céu para iluminar a terra\". E assim foi.",
        "16": "Deus fez os dois grandes luminares: o maior para governar o dia e o menor para governar a noite; fez também as estrelas.",
        "17": "Deus os colocou no firmamento do céu para iluminar a terra,",
        "18": "governar o dia e a noite, e separar a luz das trevas. E Deus viu que ficou bom.",
        "19": "Passaram-se a tarde e a manhã; esse foi o quarto dia.",
        "20": "Disse também Deus: \"Encham-se as águas de seres vivos, e voem as aves sobre a terra, sob o firmamento do céu\".",
        "21": "Assim Deus criou os grandes animais aquáticos e os demais seres vivos que povoam as águas, de acordo com as suas espécies; e todas as aves, de acordo com as suas espécies. E Deus viu que ficou bom.",
        "22": "Então Deus os abençoou, dizendo: \"Sejam férteis e multipliquem-se! Encham as águas dos mares! E multipliquem-se as aves na terra\".",
        "23": "Passaram-se a tarde e a manhã; esse foi o quinto dia.",
        "24": "E disse Deus: \"Produza a terra seres vivos de acordo com as suas espécies: rebanhos domésticos, animais selvagens e os demais seres vivos da terra, cada um de acordo com a sua espécie\". E assim foi.",
        "25": "Deus fez os animais selvagens de acordo com as suas espécies, os rebanhos domésticos de acordo com as suas espécies, e os demais seres vivos da terra de acordo com as suas espécies. E Deus viu que ficou bom.",
        "26": "Então disse Deus: \"Façamos o homem à nossa imagem, conforme a nossa semelhança. Domine ele sobre os peixes do mar, sobre as aves do céu, sobre os grandes animais de toda a terra e sobre todos os pequenos animais que se movem rente ao chão\".",
        "27": "Criou Deus o homem à sua imagem, à imagem de Deus o criou; homem e mulher os criou.",
        "28": "Deus os abençoou e lhes disse: \"Sejam férteis e multipliquem-se! Encham e subjuguem a terra! Dominem sobre os peixes do mar, sobre as aves do céu e sobre todos os animais que se movem pela terra\".",
        "29": "Disse Deus: \"Eis que dou a vocês todas as plantas que nascem em toda a terra e produzem sementes, e todas as árvores que dão frutos com sementes. Elas servirão de alimento para vocês.",
        "30": "E dou todos os vegetais como alimento a tudo o que tem em si fôlego de vida: a todos os grandes animais da terra, a todas as aves do céu e a todas as criaturas que se movem rente ao chão\". E assim foi.",
        "31": "E Deus viu tudo o que havia feito, e tudo havia ficado muito bom. Passaram-se a tarde e a manhã; esse foi o sexto dia.",
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
        "1": "No princípio, criou Deus os céus e a terra.",
        "2": "A terra, porém, estava sem forma e vazia; havia trevas sobre a face do abismo, e o Espírito de Deus pairava por sobre as águas.",
        "3": "Disse Deus: Haja luz; e houve luz.",
        "4": "E viu Deus que a luz era boa; e fez separação entre a luz e as trevas.",
        "5": "Chamou Deus à luz Dia e às trevas, Noite. Houve tarde e manhã, o primeiro dia.",
        "6": "E disse Deus: Haja firmamento no meio das águas e separação entre águas e águas.",
        "7": "Fez, pois, Deus o firmamento e separação entre as águas debaixo do firmamento e as águas sobre o firmamento. E assim se fez.",
        "8": "E chamou Deus ao firmamento Céus. Houve tarde e manhã, o segundo dia.",
        "9": "Disse também Deus: Ajuntem-se as águas debaixo dos céus num só lugar, e apareça a porção seca. E assim se fez.",
        "10": "À porção seca chamou Deus Terra e ao ajuntamento das águas, Mares. E viu Deus que isso era bom.",
        "11": "E disse: Produza a terra relva, ervas que deem semente e árvores frutíferas que deem fruto segundo a sua espécie, cuja semente esteja nele, sobre a terra. E assim se fez.",
        "12": "A terra, pois, produziu relva, ervas que davam semente segundo a sua espécie e árvores que davam fruto, cuja semente estava nele, conforme a sua espécie. E viu Deus que isso era bom.",
        "13": "Houve tarde e manhã, o terceiro dia.",
        "14": "Disse também Deus: Haja luzeiros no firmamento dos céus, para fazerem separação entre o dia e a noite; e sejam eles para sinais, para estações, para dias e anos.",
        "15": "E sejam para luzeiros no firmamento dos céus, para alumiar a terra. E assim se fez.",
        "16": "Fez Deus os dois grandes luzeiros: o maior para governar o dia, e o menor para governar a noite; e fez as estrelas.",
        "17": "E os colocou no firmamento dos céus para alumiarem a terra,",
        "18": "para governarem o dia e a noite e fazerem separação entre a luz e as trevas. E viu Deus que isso era bom.",
        "19": "Houve tarde e manhã, o quarto dia.",
        "20": "Disse também Deus: Povoem-se as águas de enxames de seres viventes; e voem as aves sobre a terra, sob o firmamento dos céus.",
        "21": "Criou, pois, Deus os grandes animais marinhos e todos os seres viventes que rastejam, os quais povoavam as águas, segundo as suas espécies; e todas as aves, segundo as suas espécies. E viu Deus que isso era bom.",
        "22": "E Deus os abençoou, dizendo: Sede fecundos, multiplicai-vos e enchei as águas dos mares; e, na terra, se multipliquem as aves.",
        "23": "Houve tarde e manhã, o quinto dia.",
        "24": "Disse também Deus: Produza a terra seres viventes, conforme a sua espécie: animais domésticos, répteis e animais selváticos, segundo a sua espécie. E assim se fez.",
        "25": "E fez Deus os animais selváticos, segundo a sua espécie, e os animais domésticos, conforme a sua espécie, e todos os répteis da terra, conforme a sua espécie. E viu Deus que isso era bom.",
        "26": "Também disse Deus: Façamos o homem à nossa imagem, conforme a nossa semelhança; tenha ele domínio sobre os peixes do mar, sobre as aves dos céus, sobre os animais domésticos, sobre toda a terra e sobre todos os répteis que rastejam pela terra.",
        "27": "Criou Deus, pois, o homem à sua imagem, à imagem de Deus o criou; homem e mulher os criou.",
        "28": "E Deus os abençoou e lhes disse: Sede fecundos, multiplicai-vos, enchei a terra e sujeitai-a; dominai sobre os peixes do mar, sobre as aves dos céus e sobre todo animal que rasteja pela terra.",
        "29": "E disse Deus ainda: Eis que vos tenho dado todas as ervas que dão semente e se acham na superfície de toda a terra e todas as árvores em que há fruto que dê semente; isso vos será para mantimento.",
        "30": "E a todos os animais da terra, e a todas as aves dos céus, e a todos os répteis da terra, em que há fôlego de vida, toda erva verde lhes será para mantimento. E assim se fez.",
        "31": "Viu Deus tudo quanto fizera, e eis que era muito bom. Houve tarde e manhã, o sexto dia.",
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
        "1": "No princípio criou Elohim (Deus) os céus e a terra.",
        "2": "E a terra era desolada e vazia, e escuridão [estava] sobre a face do abismo, e o sopro (Espírito) de Elohim pairava sobre a face das águas.",
        "3": "E disse Elohim: \"Exista luz\", e existiu luz.",
        "4": "E viu Elohim a luz, que [era] boa; e separou Elohim entre a luz e entre a escuridão.",
        "5": "E chamou Elohim à luz dia, e à escuridão chamou noite. E foi tarde e foi manhã, dia um.",
        "6": "E disse Elohim: \"Exista uma expansão no meio das águas, e seja separadora entre águas para águas\".",
        "7": "E fez Elohim a expansão, e separou entre as águas que [estavam] debaixo da expansão e entre as águas que [estavam] acima da expansão. E foi assim.",
        "8": "E chamou Elohim à expansão céus. E foi tarde e foi manhã, dia segundo.",
        "9": "E disse Elohim: \"Sejam ajuntadas as águas debaixo dos céus para um lugar, e seja vista a seca\". E foi assim.",
        "10": "E chamou Elohim à seca terra, e ao ajuntamento das águas chamou mares. E viu Elohim que [era] bom.",
        "11": "E disse Elohim: \"Faça brotar a terra broto, erva semeando semente, árvore de fruto fazendo fruto segundo a sua espécie, cuja semente [esteja] nela, sobre a terra\". E foi assim.",
        "12": "E fez sair a terra broto, erva semeando semente segundo a sua espécie, e árvore fazendo fruto cuja semente [está] nela segundo a sua espécie. E viu Elohim que [era] bom.",
        "13": "E foi tarde e foi manhã, dia terceiro.",
        "14": "E disse Elohim: \"Existam luminares na expansão dos céus para separar entre o dia e entre a noite; e sejam para sinais, e para tempos determinados, e para dias e anos;",
        "15": "E sejam para luminares na expansão dos céus para iluminar sobre a terra\". E foi assim.",
        "16": "E fez Elohim os dois luminares grandes: o luminar grande para o domínio do dia, e o luminar pequeno para o domínio da noite, e as estrelas.",
        "17": "E deu eles Elohim na expansão dos céus para iluminar sobre a terra,",
        "18": "E para dominar no dia e na noite, e para separar entre a luz e entre a escuridão. E viu Elohim que [era] bom.",
        "19": "E foi tarde e foi manhã, dia quarto.",
        "20": "E disse Elohim: \"Fervilhem as águas de fervilhamento de alma vivente, e ave voe sobre a terra sobre a face da expansão dos céus\".",
        "21": "E criou Elohim os grandes monstros marinhos, e toda alma vivente que rasteja, os quais fervilharam as águas segundo as suas espécies, e toda ave de asa segundo a sua espécie. E viu Elohim que [era] bom.",
        "22": "E abençoou eles Elohim, dizendo: \"Frutificai, e multiplicai-vos, e enchei as águas nos mares; e a ave multiplique-se na terra\".",
        "23": "E foi tarde e foi manhã, dia quinto.",
        "24": "E disse Elohim: \"Faça sair a terra alma vivente segundo a sua espécie, animal e réptil e fera da terra segundo a sua espécie\". E foi assim.",
        "25": "E fez Elohim a fera da terra segundo a sua espécie, e o animal segundo a sua espécie, e todo réptil do solo segundo a sua espécie. E viu Elohim que [era] bom.",
        "26": "E disse Elohim: \"Façamos homem à nossa imagem, conforme a nossa semelhança; e dominem nos peixes do mar, e nas aves dos céus, e no animal, e em toda a terra, e em todo réptil rastejante sobre a terra\".",
        "27": "E criou Elohim o homem à sua imagem, à imagem de Elohim criou o; macho e fêmea criou os.",
        "28": "E abençoou eles Elohim, e disse a eles Elohim: \"Frutificai, e multiplicai-vos, e enchei a terra, e sujeitai-a; e dominai nos peixes do mar, e nas aves dos céus, e em toda fera rastejante sobre a terra\".",
        "29": "E disse Elohim: \"Eis que dei a vós toda erva semeando semente que [está] sobre a face de toda a terra, e toda árvore em que [há] fruto de árvore semeando semente; a vós será para alimento.",
        "30": "E a toda fera da terra, e a toda ave dos céus, e a todo rastejante sobre a terra em que [há] alma vivente, toda verdura de erva para alimento\". E foi assim.",
        "31": "E viu Elohim tudo o que fez, e eis que [era] muito bom. E foi tarde e foi manhã, dia sexto.",
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
  
  const generated: Record<number, string> = {};
  const numVerses = 15;
  
  for (let i = 1; i <= numVerses; i++) {
    if (normTrans === "NT") {
      generated[i] = `No original hebraico/grego deste versículo ${i} de ${bookName} ${chapter}, as palavras mantêm a estrutura literal mais fiel às línguas bíblicas de origem. (Nota: texto simulado para este capítulo)`;
    } else {
      generated[i] = `Este é o texto sagrado do livro de ${bookName}, capítulo ${chapter}, versículo ${i}. O texto completo para este capítulo não está carregado na versão local para economizar espaço.`;
    }
  }
  
  return generated;
}
