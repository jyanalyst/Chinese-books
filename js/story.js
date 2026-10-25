/* Story 1: 红车比赛 (the red car race) — v1.3, Coach approved 25 Oct 2026 with changes. Hero name comes from the parent setup (first name only).
   Token syntax: "汉字|pinyin" separated by spaces; use "·" for a space inside pinyin.
   {name}/{py} are replaced from the parent setup (hero first name, never a full name).
   Every page id has an audio line id prefix (e.g. p02a -> audio/p02a_narr.mp3).
   Paths: every route is exactly 9 pages (p1 → p2x → p3x → p4x → p5x → p6x → p7x → p8x → p9). */
var STORY = {
  id: "story1_red_car_race",
  title: "红车比赛|hóng·chē·bǐsài",
  version: "v1.3 (Coach approved 25 Oct 2026 with changes)",
  start: "p1",
  words: {
    // target words (3–5 per story; these are the 5)
    che:     { zh: "车",  py: "chē",    en: "car",            target: true },
    hongse:  { zh: "红色", py: "hóngsè", en: "red",            target: true },
    kuai:    { zh: "快",  py: "kuài",   en: "fast",           target: true, forms: ["快快"] },
    man:     { zh: "慢",  py: "màn",    en: "slow",           target: true, forms: ["慢慢"] },
    ting:    { zh: "停",  py: "tíng",   en: "stop",           target: true, forms: ["停一停"] },
    // support words: tappable ONLY as picture objects (Coach v1.2); never in the sentence. 终点 is not tappable anywhere.
    hongdeng:{ zh: "红灯", py: "hóngdēng", en: "red light",   target: false },
    lvdeng:  { zh: "绿灯", py: "lǜdēng",   en: "green light", target: false },
    xiaogou: { zh: "小狗", py: "xiǎogǒu",  en: "puppy",       target: false },
    xiaomao: { zh: "小猫", py: "xiǎomāo",  en: "kitten",      target: false },
    jia:     { zh: "家",  py: "jiā",    en: "home",           target: false },
    hua:     { zh: "花",  py: "huā",    en: "flower",         target: false }
  },
  // Who the hand-off line sends him to (parent setting, default 妈妈). One clip per option: p09_handoff_<id>.mp3
  people: [
    { id: "mama",   zh: "妈妈", py: "māma",   en: "Mum" },
    { id: "baba",   zh: "爸爸", py: "bàba",   en: "Dad" },
    { id: "nainai", zh: "奶奶", py: "nǎinai", en: "Grandma (Dad's mum)" },
    { id: "yeye",   zh: "爷爷", py: "yéye",   en: "Grandpa (Dad's dad)" },
    { id: "waipo",  zh: "外婆", py: "wàipó",  en: "Grandma (Mum's mum)" },
    { id: "waigong",zh: "外公", py: "wàigōng", en: "Grandpa (Mum's dad)" }
  ],
  pages: {
    p1: { n: 1, scene: "start",
      text: "{name}|{py} 有|yǒu 一辆|yí·liàng 红色|hóngsè 的|de 车|chē 。",
      en: "{nameEn} has a red car.",
      sayit: { q: "车|Chē 是|shì 什么|shénme 颜色|yánsè ？", en: "What colour is the car?", a: "红色|Hóngsè ！", aen: "Red!" },
      choice: { q: "谁|Shéi 来|lái 比赛|bǐsài ？ 蓝|Lán 车|chē 还是|háishi 黄|huáng 车|chē ？", en: "Who comes to race? Blue car or yellow car?",
        options: [
          { id: "opt_lanche",   label: "蓝车|lán·chē",   en: "blue car",   icon: "car-blue",   next: "p2a", set: { rival: "blue" } },
          { id: "opt_huangche", label: "黄车|huáng·chē", en: "yellow car", icon: "car-yellow", next: "p2b", set: { rival: "yellow" } } ] } },

    p2a: { n: 2, scene: "startline",
      text: "蓝色|Lánsè 的|de 车|chē 来|lái 了|le 。 一起|Yìqǐ 比赛|bǐsài 吧|ba ！",
      en: "The blue car is here. Let's race together!" },
    p2b: { n: 2, scene: "startline",
      text: "黄色|Huángsè 的|de 车|chē 来|lái 了|le 。 一起|Yìqǐ 比赛|bǐsài 吧|ba ！",
      en: "The yellow car is here. Let's race together!" },

    p3a: { n: 3, scene: "road-fast",
      text: "红|Hóng 车|chē 开得|kāi·de 快|kuài 。 快|Kuài ， 快|kuài ， 快|kuài ！",
      en: "The red car goes fast. Fast, fast, fast!",
      sayit: { q: "红|Hóng 车|chē 快|kuài 还是|háishi 慢|màn ？", en: "Is the red car fast or slow?", a: "快|Kuài ！", aen: "Fast!" } },
    p3b: { n: 3, scene: "road-slow",
      text: "红|Hóng 车|chē 开得|kāi·de 慢|màn 。 慢|Màn ， 慢|màn ， 慢|màn 。",
      en: "The red car goes slowly. Slow, slow, slow.",
      sayit: { q: "红|Hóng 车|chē 快|kuài 还是|háishi 慢|màn ？", en: "Is the red car fast or slow?", a: "慢|Màn ！", aen: "Slow!" } },

    p4a: { n: 4, scene: "light-red",
      text: "红灯|Hóngdēng 亮|liàng 了|le 。 车|Chē 要|yào 停|tíng ！",
      en: "The red light is on. The car must stop!" },
    p4b: { n: 4, scene: "light-green",
      text: "绿灯|Lǜdēng 亮|liàng 了|le 。 车|Chē 可以|kěyǐ 开|kāi ！",
      en: "The green light is on. The car can go!" },

    p5a: { n: 5, scene: "crossing-dog",
      text: "小狗|Xiǎogǒu 过马路|guò·mǎlù 。 红|Hóng 车|chē 停一停|tíng·yi·tíng 。",
      en: "A puppy crosses the road. The red car stops and waits.",
      sayit: { q: "车|Chē 要|yào 快|kuài ， 还是|háishi 要|yào 停|tíng ？", en: "Should the car go fast, or stop?", a: "停|Tíng ！", aen: "Stop!" } },
    p5b: { n: 5, scene: "crossing-cat",
      text: "小猫|Xiǎomāo 过马路|guò·mǎlù 。 红|Hóng 车|chē 停一停|tíng·yi·tíng 。",
      en: "A kitten crosses the road. The red car stops and waits.",
      sayit: { q: "车|Chē 要|yào 快|kuài ， 还是|háishi 要|yào 停|tíng ？", en: "Should the car go fast, or stop?", a: "停|Tíng ！", aen: "Stop!" } },

    p6a: { n: 6, scene: "race-fast",
      text: "红|Hóng 车|chē 快快|kuàikuài 开|kāi 。 呼|Hū —— ！",
      en: "The red car drives fast. Whoosh!" },
    p6b: { n: 6, scene: "race-slow",
      text: "红|Hóng 车|chē 慢慢|mànmàn 开|kāi ， 看看|kànkan 花|huā 。",
      en: "The red car drives slowly and looks at the flowers." },

    p7a: { n: 7, scene: "finish-red",
      text: "红|Hóng 车|chē 先|xiān 到|dào 了|le ！ 好|Hǎo 快|kuài ！",
      en: "The red car gets there first! So fast!" },
    p7b: { n: 7, scene: "finish-rival",
      text: "朋友|Péngyou 先|xiān 到|dào 了|le 。 没关系|Méi·guānxi ！",
      en: "The friend gets there first. That's OK!" },

    p8a: { n: 8, scene: "home-fast",
      text: "红|Hóng 车|chē 快快|kuàikuài 开|kāi 回家|huí·jiā 。",
      en: "The red car drives home fast." },
    p8b: { n: 8, scene: "home-slow",
      text: "红|Hóng 车|chē 慢慢|mànmàn 开|kāi 回家|huí·jiā 。",
      en: "The red car drives home slowly." },

    p9: { n: 9, scene: "night", ending: true,
      text: "到家|Dào·jiā 了|le 。 红|Hóng 车|chē 停|tíng 好|hǎo 了|le 。",
      en: "Home now. The red car is parked.",
      sayit: { q: "{name}|{py} ， 你的|nǐ·de 车|chē 是|shì 什么|shénme 颜色|yánsè ？", en: "{nameEn}, what colour is YOUR car? (his own toy car — any answer is fine)", a: null },
      closing: { text: "晚安|Wǎn'ān ， 红|hóng 车|chē ！", en: "Good night, red car!" },
      // Coach design rule (v1.3): the book hands him back to a real person; it never talks as his friend.
      handoff: { text: "你|Nǐ 想|xiǎng 跟|gēn {person}|{ppy} 说说|shuōshuo 红|hóng 车|chē 吗|ma ？", en: "Would you like to tell {personEn} about the red car?" } }
  },
  // Choices: which page each page's choice leads to. Pages with no choice go to `next`.
  choices: {
    p2a: "speed", p2b: "speed",
    p3a: "light", p3b: "light",
    p4a: "animal", p4b: "animal",
    p5a: "speed2", p5b: "speed2",
    p6a: "winner", p6b: "winner",
    p7a: "speed3", p7b: "speed3"
  },
  choiceSets: {
    speed:  { q: "红|Hóng 车|chē 要|yào 快|kuài 还是|háishi 慢|màn ？", en: "Should the red car go fast or slow?",
      options: [ { id: "opt_kuai", label: "快|kuài", en: "fast", icon: "fast", next: "p3a" },
                 { id: "opt_man",  label: "慢|màn",  en: "slow", icon: "slow", next: "p3b" } ] },
    light:  { q: "看|Kàn ！ 前面|qiánmiàn 是|shì 红灯|hóngdēng 还是|háishi 绿灯|lǜdēng ？", en: "Look! Is it a red light or a green light ahead?",
      options: [ { id: "opt_hongdeng", label: "红灯|hóngdēng", en: "red light",   icon: "light-red",   next: "p4a" },
                 { id: "opt_lvdeng",   label: "绿灯|lǜdēng",   en: "green light", icon: "light-green", next: "p4b" } ] },
    animal: { q: "路上|Lù·shang 有|yǒu 谁|shéi ？ 小狗|Xiǎogǒu 还是|háishi 小猫|xiǎomāo ？", en: "Who is on the road? Puppy or kitten?",
      options: [ { id: "opt_xiaogou", label: "小狗|xiǎogǒu", en: "puppy",  icon: "dog", next: "p5a" },
                 { id: "opt_xiaomao", label: "小猫|xiǎomāo", en: "kitten", icon: "cat", next: "p5b" } ] },
    speed2: { q: "它|Tā 走了|zǒu·le 。 快快|Kuàikuài 开|kāi ， 还是|háishi 慢慢|mànmàn 开|kāi ？", en: "It's gone. Drive fast, or drive slowly?",
      options: [ { id: "opt_kuaikuai", label: "快快|kuàikuài", en: "fast", icon: "fast", next: "p6a" },
                 { id: "opt_manman",   label: "慢慢|mànmàn",   en: "slow", icon: "slow", next: "p6b" } ] },
    winner: { q: "终点|Zhōngdiǎn 到了|dào·le ！ 谁|Shéi 先|xiān 到|dào ？", en: "Here's the finish line! Who gets there first?",
      options: [ { id: "opt_hongche",  label: "红车|hóng·chē", en: "red car",  icon: "car-red",   next: "p7a" },
                 { id: "opt_pengyou",  label: "朋友|péngyou",  en: "friend",   icon: "car-rival", next: "p7b" } ] },
    speed3: { q: "回家|Huí·jiā 了|le 。 快快|Kuàikuài 开|kāi ， 还是|háishi 慢慢|mànmàn 开|kāi ？", en: "Time to go home. Drive fast, or slowly?",
      options: [ { id: "opt_kuaikuai", label: "快快|kuàikuài", en: "fast", icon: "fast", next: "p8a" },
                 { id: "opt_manman",   label: "慢慢|mànmàn",   en: "slow", icon: "slow", next: "p8b" } ] }
  },
  next: { p8a: "p9", p8b: "p9" }
};
if (typeof module !== "undefined") module.exports = STORY;
