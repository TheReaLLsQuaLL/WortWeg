import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Home, WalletCards, Mic, ClipboardList, User, Flame, Zap, Volume2, Send,
  Lock, Check, X, Hand, MessageCircle, Hash, Users, Palette, Plane, Briefcase,
  GraduationCap, Film, Heart, Sprout, Smile, Dumbbell, Trophy, Star, BookOpen,
  Medal, BarChart3, Target, Lightbulb, RotateCcw, Gift, Award, CheckCircle2,
  ArrowLeft, ArrowRight, ChevronRight, Sparkles, Coffee,
} from "lucide-react";

/* ================== WortWeg — Almanca Öğrenme MVP ==================
   Marka: Deep Violet #1E1B3A · Royal Purple #5B45F6 · Lavender #E9E6FF
   Yellow #FFC43D · Green #2DBE73 · Gradient #7C5CFF → #4B37D1
   Fontlar: Baloo 2 (başlık) + Inter (metin)
==================================================================== */

const C = {
  violet: "#1E1B3A",
  purple: "#5B45F6",
  purpleDark: "#4B37D1",
  purpleLight: "#7C5CFF",
  lav: "#E9E6FF",
  lavSoft: "#F4F2FE",
  bg: "#F7F6FD",
  yellow: "#FFC43D",
  green: "#2DBE73",
  red: "#EF4444",
  sky: "#60B5FF",
  gray: "#6E6A8A",
  white: "#FFFFFF",
};
const GRAD = `linear-gradient(135deg, ${C.purpleLight}, ${C.purpleDark})`;

/* ---------------------- ARTİKEL RENK SİSTEMİ ---------------------- */
/* Türk öğrenenin 1 numaralı sorunu: der/die/das. Kalıcı renk kodu: */
const ART = { der: "#3D8BFD", die: "#E2557B", das: "#22B573" };
const ART_LIGHT = { der: "#A7CBFF", die: "#FFB9CB", das: "#9FF0C8" };
const ART_TR = { der: "eril", die: "dişil", das: "nötr" };
const fullDe = (v) => (v.art ? `${v.art} ${v.de}` : v.de);

/* ---------------------- DERS İÇERİĞİ ---------------------- */
const LESSONS = [
  {
    id: "hallo", title: "Hallo!", subtitle: "Selamlaşma", Icon: Hand,
    grammar: { title: "Selamlaşma ipucu", body: "Almanlar günün saatine göre selamlaşır: sabah 'Guten Morgen', gündüz 'Guten Tag', akşam 'Guten Abend'. 'Hallo' ise her zaman işler — Türkçedeki 'merhaba' gibi." },
    vocab: [
      { de: "Hallo", tr: "Merhaba" },
      { de: "Guten Morgen", tr: "Günaydın" },
      { de: "Guten Tag", tr: "İyi günler" },
      { de: "Gute Nacht", tr: "İyi geceler" },
      { de: "Tschüss", tr: "Hoşça kal" },
      { de: "Danke", tr: "Teşekkürler" },
    ],
    sentences: [
      { de: ["Guten", "Morgen", "!"], tr: "Günaydın!", note: "Selamlaşmalar kalıptır: 'Guten' (iyi) + zaman dilimi. Olduğu gibi ezberle." },
      { de: ["Hallo", ",", "guten", "Tag", "!"], tr: "Merhaba, iyi günler!", note: "İki selamlaşma art arda kullanılabilir, virgülle ayrılır." },
    ],
  },
  {
    id: "wiegehts", title: "Wie geht's?", subtitle: "Hal hatır sorma", Icon: MessageCircle,
    grammar: { title: "Soru kalıbı", body: "'Wie geht es dir?' kelimesi kelimesine 'Sana nasıl gidiyor?' demektir. Türkçedeki 'Nasılsın?' gibi kalıp olarak ezberle. Resmi ortamda 'dir' yerine 'Ihnen' kullanılır." },
    vocab: [
      { de: "Wie geht es dir?", tr: "Nasılsın?" },
      { de: "Mir geht es gut", tr: "İyiyim" },
      { de: "Ich heiße Anna", tr: "Benim adım Anna" },
      { de: "Freut mich", tr: "Memnun oldum" },
      { de: "Entschuldigung", tr: "Affedersiniz" },
      { de: "Bitte", tr: "Rica ederim" },
    ],
    sentences: [
      { de: ["Wie", "geht", "es", "dir", "?"], tr: "Nasılsın?", note: "Soru cümlelerinde soru kelimesi (Wie) başa, fiil (geht) hemen ardına gelir." },
      { de: ["Mir", "geht", "es", "gut", "."], tr: "İyiyim.", note: "'Mir' = bana. Almanca 'Bana iyi gidiyor' der — kalıbı böyle düşün." },
    ],
  },
  {
    id: "zahlen", title: "Zahlen", subtitle: "Sayılar 1-10", Icon: Hash,
    grammar: { title: "Sayılarda ters okuma", body: "21'den sonra Almanlar sayıyı tersten söyler: einundzwanzig = 'bir-ve-yirmi'. Türkçenin tam tersi! Fiyat ve telefon numarası dinlerken en çok bu yanıltır." },
    vocab: [
      { de: "eins", tr: "bir" }, { de: "zwei", tr: "iki" }, { de: "drei", tr: "üç" },
      { de: "vier", tr: "dört" }, { de: "fünf", tr: "beş" }, { de: "sechs", tr: "altı" },
      { de: "sieben", tr: "yedi" }, { de: "acht", tr: "sekiz" },
    ],
    sentences: [
      { de: ["Ich", "habe", "zwei", "Brüder", "."], tr: "İki erkek kardeşim var.", note: "Türkçe 'var' yapısı Almancada 'haben' (sahip olmak) fiiliyle kurulur: 'İki kardeşe sahibim.'" },
    ],
  },
  {
    id: "familie", title: "Familie", subtitle: "Aile", Icon: Users,
    grammar: { title: "der / die / das", body: "Almancada her ismin bir cinsiyeti var ve Türkçede bunun karşılığı yok. Çözüm: kelimeyi ASLA tek başına değil, artikeliyle ve rengiyle ezberle. Mavi = der, pembe = die, yeşil = das." },
    vocab: [
      { de: "Mutter", art: "die", tr: "anne" },
      { de: "Vater", art: "der", tr: "baba" },
      { de: "Bruder", art: "der", tr: "erkek kardeş" },
      { de: "Schwester", art: "die", tr: "kız kardeş" },
      { de: "Kind", art: "das", tr: "çocuk" },
      { de: "Familie", art: "die", tr: "aile" },
    ],
    sentences: [
      { de: ["Das", "ist", "meine", "Familie", "."], tr: "Bu benim ailem.", note: "'Familie' die aldığı için 'benim' kelimesi 'meine' olur (mein + e). Artikel her şeyi etkiler!" },
    ],
  },
  {
    id: "essen", title: "Essen", subtitle: "Yiyecek & İçecek", Icon: Coffee,
    grammar: { title: "Fiil 2. pozisyonda", body: "Almanca ana cümlede çekimli fiil HER ZAMAN 2. sıradadır: 'Ich trinke Kaffee.' Türkçede fiil sonda olduğu için en sık yapılan hata budur — cümle kurarken fiili öne al." },
    vocab: [
      { de: "Brot", art: "das", tr: "ekmek" },
      { de: "Apfel", art: "der", tr: "elma" },
      { de: "Milch", art: "die", tr: "süt" },
      { de: "Wasser", art: "das", tr: "su" },
      { de: "Käse", art: "der", tr: "peynir" },
      { de: "Kaffee", art: "der", tr: "kahve" },
    ],
    sentences: [
      { de: ["Ich", "trinke", "gern", "Kaffee", "."], tr: "Kahve içmeyi severim.", note: "Fiil (trinke) 2. pozisyonda. 'gern' = severek; Türkçedeki '-meyi severim' anlamını tek kelimeyle verir." },
    ],
  },
  {
    id: "farben", title: "Farben", subtitle: "Renkler", Icon: Palette,
    grammar: { title: "Sende avantaj!", body: "Renkler 'sein' (olmak) fiiliyle kullanılır: 'Der Himmel ist blau.' Türkçedeki 'Gökyüzü mavidir' ile aynı dizilim — Türkçe konuşanlar için bedava puan." },
    vocab: [
      { de: "rot", tr: "kırmızı" }, { de: "blau", tr: "mavi" }, { de: "grün", tr: "yeşil" },
      { de: "gelb", tr: "sarı" }, { de: "schwarz", tr: "siyah" }, { de: "weiß", tr: "beyaz" },
    ],
    sentences: [
      { de: ["Der", "Himmel", "ist", "blau", "."], tr: "Gökyüzü mavi.", note: "'Himmel' der aldığı için cümle 'Der Himmel' ile başlar. Sıfat (blau) fiilden sonra çekimsiz gelir." },
    ],
  },
];

const ALL_VOCAB = LESSONS.flatMap((l) => l.vocab.map((v) => ({ ...v, lesson: l.title, key: fullDe(v) })));
const VOCAB_BY_KEY = Object.fromEntries(ALL_VOCAB.map((v) => [v.key, v]));

/* Goethe A1 Lesen (okuma) soruları — gerçek sınav formatı: kısa not/ilan + soru */
const LESEN_ITEMS = [
  { text: "Liebe Anna, ich komme am Montag um 9 Uhr nach Berlin. Bis bald! – Maria", q: "Maria ne zaman geliyor?", options: ["Pazartesi saat 9'da", "Salı akşamı", "Pazar sabahı", "Cuma saat 9'da"], answer: "Pazartesi saat 9'da", why: "am Montag = pazartesi günü, um 9 Uhr = saat 9'da. 'am' + gün, 'um' + saat kalıbını ezberle." },
  { text: "Geöffnet: Mo–Fr 8–18 Uhr. Samstag und Sonntag geschlossen.", q: "Mağaza cumartesi açık mı?", options: ["Hayır, kapalı", "Evet, açık", "Sadece sabah açık", "Sadece öğleden sonra açık"], answer: "Hayır, kapalı", why: "geschlossen = kapalı, geöffnet = açık. Samstag = cumartesi. Tabelalarda bu iki kelime kritik." },
  { text: "Hallo Tom, das Kino beginnt um 20 Uhr. Wir treffen uns um 19.30 am Eingang. – Lisa", q: "Lisa ve Tom saat kaçta buluşuyor?", options: ["19.30'da", "20.00'de", "18.30'da", "21.00'de"], answer: "19.30'da", why: "Film 20.00'de başlıyor ama 'wir treffen uns' (buluşuyoruz) 19.30. Soruda istenen buluşma saati — tuzağa dikkat." },
  { text: "Zimmer frei: 2 Zimmer, Küche, Bad. 450 Euro pro Monat. Tel: 030-1234", q: "Bu ilan ne hakkında?", options: ["Kiralık daire", "Satılık araba", "İş ilanı", "Ders ilanı"], answer: "Kiralık daire", why: "Zimmer frei = boş oda/daire, pro Monat = aylık. Almanya'da ev ararken göreceğin ilk kalıp." },
  { text: "Lieber Herr Schmidt, der Termin am Freitag fällt aus. Neuer Termin: Dienstag, 10 Uhr.", q: "Cuma günkü randevuya ne oldu?", options: ["İptal edildi", "Öne alındı", "Aynı gün kaldı", "Cumartesiye alındı"], answer: "İptal edildi", why: "fällt aus = iptal oldu (ausfallen fiili). 'Termin' (randevu) Almanya'da hayatın merkezi bir kelimesi." },
];

/* ---------------------- YARDIMCILAR ---------------------- */
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
const todayStr = () => new Date().toISOString().slice(0, 10);

function speak(text, rate = 0.92) {
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "de-DE"; u.rate = rate;
    const voices = window.speechSynthesis.getVoices();
    const de = voices.find((v) => v.lang && v.lang.startsWith("de"));
    if (de) u.voice = de;
    window.speechSynthesis.speak(u);
  } catch (e) {}
}

const STORAGE_KEY = "wortweg-state-v1";
const DEFAULT_STATE = {
  onboarded: false, name: "", level: "a1", reason: "", dailyGoal: 20,
  xp: 0, todayXp: 0, lastDay: "", streak: 0,
  completed: [], examHistory: [],
  wordStats: {},   // SRS: { [key]: {box, due, right, wrong} }
  mistakes: [],    // Hata defteri: { prompt, answer, why, type, key, date }
};

async function loadState() {
  try {
    const r = await window.storage.get(STORAGE_KEY);
    if (r && r.value) {
      const s = { ...DEFAULT_STATE, ...JSON.parse(r.value) };
      if (s.lastDay !== todayStr()) s.todayXp = 0;
      return s;
    }
  } catch (e) {}
  return { ...DEFAULT_STATE };
}
async function saveState(s) { try { await window.storage.set(STORAGE_KEY, JSON.stringify(s)); } catch (e) {} }

/* ---------------------- SRS (Aralıklı Tekrar) ---------------------- */
const SRS_DAYS = [0, 1, 3, 7, 14]; // Leitner kutuları
function bumpStat(stats, key, ok) {
  const st = stats[key] || { box: 0, right: 0, wrong: 0, due: todayStr() };
  const box = ok ? Math.min(st.box + 1, 4) : 0;
  const d = new Date(); d.setDate(d.getDate() + SRS_DAYS[box]);
  return { ...stats, [key]: { box, right: st.right + (ok ? 1 : 0), wrong: st.wrong + (ok ? 0 : 1), due: d.toISOString().slice(0, 10) } };
}
function unlockedLessons(state) {
  const ids = new Set([LESSONS[0].id, ...state.completed]);
  state.completed.forEach((id) => {
    const i = LESSONS.findIndex((l) => l.id === id);
    if (LESSONS[i + 1]) ids.add(LESSONS[i + 1].id);
  });
  return LESSONS.filter((l) => ids.has(l.id));
}
function getDueWords(state) {
  const t = todayStr();
  return Object.entries(state.wordStats)
    .filter(([k, st]) => st.due <= t && VOCAB_BY_KEY[k])
    .sort((a, b) => a[1].box - b[1].box)
    .map(([k]) => VOCAB_BY_KEY[k])
    .slice(0, 10);
}
function knownWordCount(state) {
  return Object.values(state.wordStats).filter((st) => st.box >= 2).length;
}
function cefrPct(state) {
  const lessonPart = (state.completed.length / LESSONS.length) * 70;
  const wordPart = (knownWordCount(state) / ALL_VOCAB.length) * 30;
  return Math.min(100, Math.round(lessonPart + wordPart));
}

/* ---------------------- AÇIKLAMA ÜRETİCİ (mikro-gramer) ---------------------- */
function whyFor(type, v, sentence) {
  if (type === "artikel") return `"${v.de}" kelimesi ${v.art} artikelini alır (${ART_TR[v.art]}). Türkçede cinsiyet olmadığı için renkle ezberle: ${v.art} ${v.de}.`;
  if (type === "build") return sentence?.note || "Almanca ana cümlede çekimli fiil her zaman 2. pozisyondadır.";
  const a = v.art ? ` Artikeliyle ezberle: ${fullDe(v)} (${ART_TR[v.art]}).` : "";
  if (type === "de2tr") return `"${fullDe(v)}" = "${v.tr}".${a}`;
  if (type === "tr2de") return `"${v.tr}" = "${fullDe(v)}".${a}`;
  if (type === "listen") return `Duyduğun kelime: "${fullDe(v)}" = "${v.tr}".${a}`;
  return "";
}

/* ---------------------- EGZERSİZ ÜRETİCİLERİ ---------------------- */
function mcq(type, v) {
  const others = shuffle(ALL_VOCAB.filter((o) => o.key !== v.key)).slice(0, 3);
  if (type === "tr2de") return { type, key: v.key, prompt: v.tr, answer: fullDe(v), options: shuffle([fullDe(v), ...others.map(fullDe)]), why: whyFor(type, v) };
  if (type === "artikel") return { type, key: v.key, prompt: v.de, answer: v.art, options: ["der", "die", "das"], why: whyFor(type, v) };
  return { type, key: v.key, prompt: fullDe(v), answer: v.tr, options: shuffle([v.tr, ...others.map((o) => o.tr)]), why: whyFor(type, v) };
}

function buildExercises(lesson) {
  const ex = [];
  lesson.vocab.forEach((v, i) => {
    const cycle = v.art ? ["de2tr", "artikel", "listen"] : ["de2tr", "tr2de", "listen"];
    ex.push(mcq(cycle[i % 3], v));
  });
  lesson.sentences.forEach((s) => {
    ex.push({ type: "build", words: shuffle(s.de), answer: s.de, tr: s.tr, why: whyFor("build", null, s) });
  });
  return shuffle(ex).slice(0, 8);
}

function buildReview(words) {
  return shuffle(words.map((v, i) => {
    const cycle = v.art ? ["artikel", "de2tr", "tr2de"] : ["de2tr", "tr2de", "listen"];
    return mcq(cycle[i % 3], v);
  }));
}

function buildExam() {
  return shuffle(ALL_VOCAB).slice(0, 10).map((v, i) => {
    const t = i % 3 === 0 ? "listen" : v.art && i % 2 === 0 ? "artikel" : i % 2 === 0 ? "de2tr" : "tr2de";
    return mcq(t, v);
  });
}

/* Goethe A1 deneme: Hören (Teil 1) + Lesen (Teil 2) — gerçek sınav yapısı */
function buildGoethe() {
  const hoeren = shuffle(ALL_VOCAB).slice(0, 5).map((v) => ({ ...mcq("listen", v), section: "Hören · Bölüm 1" }));
  const lesen = shuffle(LESEN_ITEMS).map((it) => ({
    type: "lesen", section: "Lesen · Bölüm 2", text: it.text, prompt: it.q,
    options: shuffle(it.options), answer: it.answer, why: it.why,
  }));
  return [...hoeren, ...lesen];
}

/* ============ 2026 REDESIGN — tasarım sistemi v2 ============
   Trendler: aurora mesh arka plan · glassmorphism 2.0 · bento grid
   süper-elips kartlar (r26) · progress ring'ler · dev tipografi
   yüzen pill tab bar · sesli AI orb · taktil 3D butonlar · gece modu hero
============================================================ */
const NIGHT = "linear-gradient(180deg,#262052 0%,#1E1B3A 70%)";

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');
      * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
      body { margin: 0; }
      .ww-root { font-family:'Inter',sans-serif; color:${C.violet}; min-height:100vh; background:#ECEAF9; position:relative; }
      .baloo { font-family:'Baloo 2',cursive; }

      /* Liquid Glass'in kirilmasi icin canli aurora zemin */
      .aurora { position:fixed; inset:0; pointer-events:none; z-index:0; overflow:hidden; }
      .aurora::before, .aurora::after { content:""; position:absolute; border-radius:50%; filter:blur(70px); }
      .aurora::before { width:440px; height:440px; left:-120px; top:-100px;
        background:radial-gradient(circle, rgba(124,92,255,.38), transparent 65%);
        animation:drift1 16s ease-in-out infinite alternate; }
      .aurora::after { width:400px; height:400px; right:-110px; top:34%;
        background:radial-gradient(circle, rgba(96,181,255,.32), transparent 65%);
        animation:drift2 19s ease-in-out infinite alternate; }
      .aurora2 { position:fixed; left:18%; bottom:-160px; width:460px; height:460px; border-radius:50%;
        background:radial-gradient(circle, rgba(255,196,61,.26), transparent 65%);
        filter:blur(70px); pointer-events:none; z-index:0; animation:drift1 22s ease-in-out infinite alternate-reverse; }
      @keyframes drift1 { to { transform:translate(60px,40px) scale(1.12) } }
      @keyframes drift2 { to { transform:translate(-50px,-60px) scale(1.08) } }

      /* ===== LIQUID GLASS materyali =====
         spekuler kenar isigi (ust-aydinlik / alt-golge), yuksek blur+saturasyon, ust parlama */
      .glass { position:relative; isolation:isolate;
        background:rgba(255,255,255,.40);
        backdrop-filter:blur(28px) saturate(1.9); -webkit-backdrop-filter:blur(28px) saturate(1.9);
        border:1px solid rgba(255,255,255,.45);
        box-shadow:
          inset 0 1.5px 1px rgba(255,255,255,.95),
          inset 0 -1px 1px rgba(255,255,255,.28),
          inset 1.5px 0 1px rgba(255,255,255,.35),
          inset -1.5px 0 1px rgba(255,255,255,.35),
          0 18px 44px -14px rgba(30,27,58,.30); }
      .glass::before { content:""; position:absolute; inset:0; border-radius:inherit; z-index:-1;
        background:linear-gradient(180deg, rgba(255,255,255,.42), rgba(255,255,255,0) 36%); pointer-events:none; }

      .glass-dark { position:relative; isolation:isolate;
        background:rgba(255,255,255,.10);
        backdrop-filter:blur(22px) saturate(1.6); -webkit-backdrop-filter:blur(22px) saturate(1.6);
        border:1px solid rgba(255,255,255,.22);
        box-shadow:
          inset 0 1px 1px rgba(255,255,255,.30),
          inset 0 -1px 1px rgba(255,255,255,.08),
          0 16px 36px -14px rgba(0,0,0,.45); }
      .glass-dark::before { content:""; position:absolute; inset:0; border-radius:inherit; z-index:-1;
        background:linear-gradient(180deg, rgba(255,255,255,.16), rgba(255,255,255,0) 40%); pointer-events:none; }

      /* icerik kartlari: yari-saydam cam panel */
      .card { position:relative; isolation:isolate;
        background:rgba(255,255,255,.55);
        backdrop-filter:blur(24px) saturate(1.7); -webkit-backdrop-filter:blur(24px) saturate(1.7);
        border-radius:26px; border:1px solid rgba(255,255,255,.6);
        box-shadow:
          inset 0 1.5px 1px rgba(255,255,255,.95),
          inset 0 -1px 1px rgba(255,255,255,.25),
          0 16px 40px -14px rgba(91,69,246,.20); }
      .card::before { content:""; position:absolute; inset:0; border-radius:inherit; z-index:-1;
        background:linear-gradient(180deg, rgba(255,255,255,.40), rgba(255,255,255,0) 34%); pointer-events:none; }

      .ww-btn { transition:transform .12s ease, box-shadow .12s ease, filter .15s; cursor:pointer; border:none; }
      .btn3d:active { transform:translateY(3px) scale(.995); filter:brightness(1.05); }
      .ww-btn:disabled { cursor:default; }
      .pop { animation:pop .4s cubic-bezier(.3,1.6,.5,1); }
      @keyframes pop { from { transform:scale(.7); opacity:0 } to { transform:scale(1); opacity:1 } }
      .fadeup { animation:fadeup .45s ease both; }
      @keyframes fadeup { from { transform:translateY(16px); opacity:0 } to { transform:none; opacity:1 } }
      @keyframes bounce { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-8px) } }
      @keyframes twinkle { 0%,100% { opacity:.25 } 50% { opacity:.9 } }
      @keyframes orbspin { to { transform:rotate(360deg) } }
      @keyframes orbpulse { 0%,100% { box-shadow:0 0 0 0 rgba(124,92,255,.45) } 50% { box-shadow:0 0 0 14px rgba(124,92,255,0) } }
      .ww-opt { transition:all .15s; }
      .ww-opt:hover { border-color:${C.purple} !important; }
      input::placeholder { color:#A8A3C7; }
      @media (prefers-reduced-motion:reduce) { .pop,.fadeup,.orb,.star,.aurora::before,.aurora::after,.aurora2 { animation:none !important } }
      ::-webkit-scrollbar { width:0; height:0 }
    `}</style>
  );
}

/* Wolli — baykuş maskot */
function Wolli({ size = 110, wave = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={wave ? { animation: "bounce 2.4s ease-in-out infinite" } : undefined}>
      <ellipse cx="60" cy="112" rx="26" ry="5" fill="rgba(30,27,58,.10)" />
      <path d="M28 60 Q14 52 12 64 Q11 74 30 76 Z" fill="#7A5FE0" />
      <ellipse cx="60" cy="70" rx="32" ry="36" fill="#8B6FE8" />
      <ellipse cx="60" cy="80" rx="20" ry="22" fill="#C9BCF5" />
      <path d="M48 80 q6 6 12 0 q6 6 12 0" stroke="#B5A6EF" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <circle cx="47" cy="52" r="13" fill="#fff" /><circle cx="73" cy="52" r="13" fill="#fff" />
      <circle cx="49" cy="54" r="6.5" fill="#2A2440" /><circle cx="71" cy="54" r="6.5" fill="#2A2440" />
      <circle cx="51" cy="52" r="2" fill="#fff" /><circle cx="73" cy="52" r="2" fill="#fff" />
      <path d="M55 64 L65 64 L60 72 Z" fill="#FFB020" />
      <path d="M30 42 Q26 22 60 24 Q94 22 90 42 L88 48 Q60 38 32 48 Z" fill="#FFC43D" />
      <ellipse cx="60" cy="22" rx="9" ry="8" fill="#FFD46B" />
      <path d="M32 46 Q60 36 88 46 L88 40 Q60 30 32 40 Z" fill="#F0A82E" />
      <ellipse cx="50" cy="108" rx="7" ry="4" fill="#FFB020" />
      <ellipse cx="70" cy="108" rx="7" ry="4" fill="#FFB020" />
      <path d="M88 62 Q104 50 106 66 Q107 76 86 78 Z" fill="#7A5FE0" />
    </svg>
  );
}

function Logo({ size = 30, light = false }) {
  return (
    <span className="baloo" style={{ fontWeight: 800, fontSize: size, color: light ? "#fff" : C.violet, letterSpacing: -0.5, display: "inline-flex", alignItems: "center" }}>
      W
      <span style={{ width: size * 0.78, height: size * 0.78, background: GRAD, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", margin: "0 1px", boxShadow: "0 2px 8px rgba(91,69,246,.4)" }}>
        <span style={{ width: 0, height: 0, borderTop: `${size * 0.16}px solid transparent`, borderBottom: `${size * 0.16}px solid transparent`, borderLeft: `${size * 0.27}px solid ${C.yellow}`, marginLeft: size * 0.07 }} />
      </span>
      rtWeg
    </span>
  );
}

function Btn({ children, onClick, variant = "primary", disabled, style }) {
  const base = {
    primary: { background: disabled ? "rgba(124,92,255,.30)" : GRAD, color: "#fff", boxShadow: disabled ? "inset 0 1px 1px rgba(255,255,255,.4)" : `inset 0 2px 1.5px rgba(255,255,255,.5), inset 0 -2px 3px rgba(0,0,0,.18), 0 14px 30px -8px rgba(91,69,246,.55)` },
    secondary: { background: "rgba(255,255,255,.42)", color: C.purple, border: `1px solid rgba(255,255,255,.55)`, backdropFilter: "blur(24px) saturate(1.8)", WebkitBackdropFilter: "blur(24px) saturate(1.8)", boxShadow: "inset 0 1.5px 1px rgba(255,255,255,.95), inset 0 -1px 1px rgba(255,255,255,.3), 0 12px 28px -10px rgba(30,27,58,.25)" },
    green: { background: "linear-gradient(135deg,#3DD688,#1FA864)", color: "#fff", boxShadow: "inset 0 2px 1.5px rgba(255,255,255,.5), inset 0 -2px 3px rgba(0,0,0,.18), 0 14px 30px -8px rgba(31,168,100,.5)" },
    night: { background: "rgba(255,255,255,.14)", color: "#fff", border: "1px solid rgba(255,255,255,.25)", backdropFilter: "blur(10px)" },
  }[variant];
  return (
    <button className={`ww-btn baloo ${disabled ? "" : "btn3d"}`} disabled={disabled} onClick={onClick}
      style={{ width: "100%", padding: "15px 20px", borderRadius: 22, fontSize: 17, fontWeight: 800, letterSpacing: .2, ...base, ...style }}>
      {children}
    </button>
  );
}

function Chip({ children, color = C.purple, bg = "rgba(255,255,255,.5)", onClick, style }) {
  return (
    <span onClick={onClick} className={onClick ? "ww-btn" : ""} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 13px", borderRadius: 99, background: bg, color, fontWeight: 700, fontSize: 13, backdropFilter: "blur(18px) saturate(1.7)", WebkitBackdropFilter: "blur(18px) saturate(1.7)", boxShadow: "inset 0 1px 1px rgba(255,255,255,.85), 0 6px 16px -6px rgba(30,27,58,.20)", border: "1px solid rgba(255,255,255,.55)", cursor: onClick ? "pointer" : "default", ...style }}>
      {children}
    </span>
  );
}

/* Progress Ring — 2026: bar yerine halka */
function Ring({ size = 88, stroke = 9, value, color = C.purple, track = C.lav, children }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const off = c - (Math.min(100, Math.max(0, value)) / 100) * c;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" style={{ transition: "stroke-dashoffset .6s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>{children}</div>
    </div>
  );
}

function SegmentProgress({ step, total }) {
  return (
    <div style={{ display: "flex", gap: 6, flex: 1 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: 7, borderRadius: 99, background: i <= step ? GRAD : "#E4E0F7", transition: "background .3s" }} />
      ))}
    </div>
  );
}

/* ---------------------- ONBOARDING v2 ---------------------- */
const OB_REASONS = [
  { id: "travel", Icon: Plane, label: "Seyahat için" },
  { id: "career", Icon: Briefcase, label: "Kariyer / iş için" },
  { id: "school", Icon: GraduationCap, label: "Okul / sınav için" },
  { id: "culture", Icon: Film, label: "Kültür ve eğlence" },
  { id: "family", Icon: Heart, label: "Aile ve arkadaşlar" },
];
const OB_LEVELS = [
  { id: "a0", Icon: Sprout, label: "Sıfırdan başlıyorum", sub: "Hiç Almanca bilmiyorum" },
  { id: "a1", Icon: Smile, label: "Birkaç kelime biliyorum", sub: "Selamlaşma, sayılar..." },
  { id: "a2", Icon: Dumbbell, label: "Basit cümleler kurabilirim", sub: "Temel konuşmalar" },
];
const OB_GOALS = [
  { xp: 10, label: "Rahat", sub: "Günde 5 dk" },
  { xp: 20, label: "Normal", sub: "Günde 10 dk" },
  { xp: 30, label: "Ciddi", sub: "Günde 15 dk" },
  { xp: 50, label: "Yoğun", sub: "Günde 20+ dk" },
];

function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const [reason, setReason] = useState("");
  const [level, setLevel] = useState("");
  const [goal, setGoal] = useState(0);
  const [name, setName] = useState("");
  const total = 5;

  const titles = [
    null,
    "Neden Almanca\nöğreniyorsun?",
    "Seviyeni\nseçelim",
    "Günlük hedefin\nne olsun?",
    "Sana nasıl\nseslenelim?",
  ];
  const canNext = step === 0 || (step === 1 && reason) || (step === 2 && level) || (step === 3 && goal) || (step === 4 && name.trim());
  const next = () => step < total - 1 ? setStep(step + 1) : onDone({ reason, level, dailyGoal: goal, name: name.trim() });

  const Option = ({ active, onClick, children }) => (
    <button className="ww-btn ww-opt" onClick={onClick} style={{
      width: "100%", textAlign: "left", padding: "16px 18px", borderRadius: 24, fontSize: 16,
      fontFamily: "Inter", fontWeight: 700, marginBottom: 12, color: C.violet,
      background: active ? "rgba(255,255,255,.6)" : "rgba(255,255,255,.38)",
      backdropFilter: "blur(24px) saturate(1.8)", WebkitBackdropFilter: "blur(24px) saturate(1.8)",
      border: `2px solid ${active ? C.purple : "rgba(255,255,255,.5)"}`,
      boxShadow: active ? "inset 0 1.5px 1px rgba(255,255,255,.95), 0 16px 34px -10px rgba(91,69,246,.4)" : "inset 0 1.5px 1px rgba(255,255,255,.9), 0 8px 20px -10px rgba(30,27,58,.15)",
      display: "flex", alignItems: "center", gap: 14, position: "relative",
    }}>
      {children}
      {active && <span style={{ position: "absolute", right: 14, width: 26, height: 26, borderRadius: "50%", background: GRAD, display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={15} color="#fff" strokeWidth={3.2} /></span>}
    </button>
  );
  const IconBubble = ({ Icon }) => (
    <span style={{ width: 44, height: 44, borderRadius: 15, background: "rgba(233,230,255,.7)", boxShadow: "inset 0 1px 1px rgba(255,255,255,.9)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon size={22} color={C.purple} />
    </span>
  );

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column", padding: 22, position: "relative", zIndex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10 }}>
        {step > 0 ? (
          <button className="ww-btn glass" onClick={() => setStep(step - 1)} style={{ width: 40, height: 40, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", color: C.violet }}><ArrowLeft size={19} /></button>
        ) : <span style={{ width: 40 }} />}
        <SegmentProgress step={step} total={total} />
        <span style={{ width: 40 }} />
      </div>

      <div key={step} className="fadeup" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {step === 0 ? (
          <div style={{ textAlign: "center" }}>
            <div className="pop" style={{ display: "inline-block", padding: 26, borderRadius: 40, background: "rgba(255,255,255,.45)", backdropFilter: "blur(26px) saturate(1.8)", WebkitBackdropFilter: "blur(26px) saturate(1.8)", border: "1px solid rgba(255,255,255,.6)", boxShadow: "inset 0 2px 1.5px rgba(255,255,255,.95), 0 26px 54px -16px rgba(91,69,246,.4)" }}>
              <Wolli size={150} wave />
            </div>
            <div style={{ marginTop: 26 }}><Logo size={44} /></div>
            <h1 className="baloo" style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.15, margin: "10px 0 8px", letterSpacing: -0.6 }}>
              Her gün <span style={{ background: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>küçük bir kazanım</span>
            </h1>
            <p style={{ color: C.gray, fontSize: 15, lineHeight: 1.55, margin: 0 }}>
              Dersler · Kelime kartları · AI sesli sohbet<br />Sınav pratiği ve detaylı analiz
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <Wolli size={62} />
              <h1 className="baloo" style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.12, letterSpacing: -0.6, margin: 0, whiteSpace: "pre-line" }}>{titles[step]}</h1>
            </div>
            <div style={{ height: 18 }} />
            {step === 1 && OB_REASONS.map((r) => (
              <Option key={r.id} active={reason === r.id} onClick={() => setReason(r.id)}>
                <IconBubble Icon={r.Icon} /> {r.label}
              </Option>
            ))}
            {step === 2 && OB_LEVELS.map((l) => (
              <Option key={l.id} active={level === l.id} onClick={() => setLevel(l.id)}>
                <IconBubble Icon={l.Icon} />
                <span>{l.label}<br /><small style={{ color: C.gray, fontWeight: 500 }}>{l.sub}</small></span>
              </Option>
            ))}
            {step === 3 && OB_GOALS.map((g) => (
              <Option key={g.xp} active={goal === g.xp} onClick={() => setGoal(g.xp)}>
                <span className="baloo" style={{ width: 64, fontSize: 19, fontWeight: 800, color: C.purple, flexShrink: 0 }}>{g.xp} XP</span>
                <span>{g.label}<br /><small style={{ color: C.gray, fontWeight: 500 }}>{g.sub}</small></span>
              </Option>
            ))}
            {step === 4 && (
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Adın..."
                style={{ width: "100%", padding: "18px 20px", borderRadius: 22, border: `2px solid transparent`, fontSize: 18, fontFamily: "Inter", fontWeight: 700, outline: "none", color: C.violet, background: "rgba(255,255,255,.45)", backdropFilter: "blur(24px) saturate(1.8)", WebkitBackdropFilter: "blur(24px) saturate(1.8)", boxShadow: "inset 0 1.5px 1px rgba(255,255,255,.95), 0 12px 30px -10px rgba(30,27,58,.2)" }}
                onFocus={(e) => (e.target.style.borderColor = C.purple)} onBlur={(e) => (e.target.style.borderColor = "transparent")} />
            )}
          </>
        )}
      </div>

      <Btn onClick={next} disabled={!canNext} style={{ marginBottom: 12 }}>
        {step === 0 ? "Hadi başlayalım" : step === total - 1 ? "Yolculuğa başla 🚀" : "Devam"}
      </Btn>
    </div>
  );
}

/* ---------------------- ANA SAYFA v3 ---------------------- */
function ArtWord({ v, size = 16, light = false }) {
  const pal = light ? ART_LIGHT : ART;
  return (
    <span className="baloo" style={{ fontSize: size, fontWeight: 800, color: light ? "#fff" : C.violet }}>
      {v.art && <span style={{ color: pal[v.art] }}>{v.art} </span>}{v.de}
    </span>
  );
}

function TopBar({ state }) {
  return (
    <div className="glass" style={{ position: "sticky", top: 10, zIndex: 40, margin: "10px 16px 0", padding: "10px 16px", borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Logo size={24} />
      <div style={{ display: "flex", gap: 8 }}>
        <Chip color="#E8821E" bg="rgba(255,244,226,.65)"><Flame size={14} fill="#E8821E" /> {state.streak}</Chip>
        <Chip color={C.purple} bg="rgba(233,230,255,.6)"><Zap size={14} fill={C.purple} /> {state.xp}</Chip>
      </div>
    </div>
  );
}

const STARS = Array.from({ length: 26 }).map((_, i) => ({
  left: (i * 37 + 13) % 100, top: (i * 53 + 7) % 88, s: 1.5 + (i % 3), d: (i % 5) + 2,
}));

const REASON_MSG = {
  family: "Goethe A1 hedefine her gün bir adım daha.",
  career: "Kariyer hedefin için Almanca — devam!",
  school: "Sınav hedefine doğru ilerliyorsun.",
  travel: "Seyahatin için hazırlanıyorsun.",
  culture: "Keyifle öğrenmeye devam.",
};

function HomePath({ state, onStartLesson, onStartReview }) {
  const doneCount = state.completed.length;
  const goalPct = Math.round((state.todayXp / state.dailyGoal) * 100);
  const due = getDueWords(state);
  const cefr = cefrPct(state);
  return (
    <div style={{ padding: "0 16px 130px", position: "relative", zIndex: 1 }}>
      {/* Günlük hedef + CEFR */}
      <div className="card fadeup" style={{ marginTop: 14, padding: 18, display: "flex", alignItems: "center", gap: 16 }}>
        <Ring size={92} stroke={10} value={goalPct} color={goalPct >= 100 ? C.green : C.purple}>
          {goalPct >= 100 ? <Trophy size={26} color={C.green} /> : (
            <>
              <span className="baloo" style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{Math.min(state.todayXp, state.dailyGoal)}</span>
              <span style={{ fontSize: 10.5, color: C.gray, fontWeight: 700 }}>/ {state.dailyGoal} XP</span>
            </>
          )}
        </Ring>
        <div style={{ flex: 1 }}>
          <div className="baloo" style={{ fontSize: 21, fontWeight: 800, letterSpacing: -0.4 }}>Guten Tag, {state.name}!</div>
          <div style={{ fontSize: 13, color: C.gray, marginTop: 2, lineHeight: 1.45 }}>
            {goalPct >= 100 ? "Günlük hedef tamam — harikasın! 🎉" : (REASON_MSG[state.reason] || "Bugün küçük bir kazanım seni bekliyor.")}
          </div>
          <Chip color={C.purple} bg="rgba(233,230,255,.6)" style={{ marginTop: 8, fontSize: 11.5 }}>
            <GraduationCap size={13} /> A1 seviyesi · %{cefr}
          </Chip>
        </div>
        <div style={{ alignSelf: "flex-start" }}><Wolli size={54} /></div>
      </div>

      {/* SRS: tekrar zamanı kartı */}
      {due.length > 0 && (
        <div className="card fadeup" style={{ marginTop: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, animationDelay: ".06s" }}>
          <span style={{ width: 46, height: 46, borderRadius: 16, background: "rgba(255,196,61,.25)", boxShadow: "inset 0 1px 1px rgba(255,255,255,.8)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <RotateCcw size={21} color="#C98C0F" />
          </span>
          <div style={{ flex: 1 }}>
            <div className="baloo" style={{ fontWeight: 800, fontSize: 15.5 }}>Tekrar zamanı</div>
            <div style={{ fontSize: 12.5, color: C.gray, fontWeight: 600 }}>{due.length} kelime unutulmak üzere — 2 dakikada tazele.</div>
          </div>
          <button className="ww-btn btn3d baloo" onClick={onStartReview} style={{ padding: "10px 16px", borderRadius: 16, background: GRAD, color: "#fff", fontWeight: 800, fontSize: 14, boxShadow: "inset 0 1.5px 1px rgba(255,255,255,.45), 0 10px 22px -8px rgba(91,69,246,.5)" }}>
            Tekrarla
          </button>
        </div>
      )}

      {/* Gece modu ders yolu */}
      <div className="fadeup" style={{ marginTop: 16, borderRadius: 30, background: NIGHT, padding: "22px 18px 0", position: "relative", overflow: "hidden", boxShadow: "0 24px 50px -18px rgba(30,27,58,.55)", animationDelay: ".1s" }}>
        {STARS.map((st, i) => (
          <span key={i} className="star" style={{ position: "absolute", left: `${st.left}%`, top: `${st.top}%`, width: st.s, height: st.s, borderRadius: "50%", background: "#fff", opacity: .4, animation: `twinkle ${st.d}s ease-in-out infinite` }} />
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
          <div>
            <div className="baloo" style={{ color: "#fff", fontSize: 20, fontWeight: 800, letterSpacing: -0.3 }}>Grundlagen 1</div>
            <div style={{ color: "rgba(255,255,255,.65)", fontSize: 12.5, fontWeight: 600 }}>Temeller · {doneCount}/{LESSONS.length} ders</div>
          </div>
          <span className="glass-dark" style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 13px", borderRadius: 99, color: "#fff", fontWeight: 700, fontSize: 13 }}>
            <Sparkles size={13} /> A1
          </span>
        </div>

        <div style={{ position: "relative", marginTop: 26, paddingBottom: 110 }}>
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox={`0 0 340 ${LESSONS.length * 96}`} preserveAspectRatio="none">
            <path
              d={LESSONS.map((_, i) => {
                const x = [44, 104, 154, 104, 44][i % 5] + 30, y = i * 96 + 34;
                return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
              }).join(" ")}
              stroke="rgba(255,255,255,.22)" strokeWidth="4" strokeDasharray="2 10" strokeLinecap="round" fill="none" />
          </svg>
          {LESSONS.map((l, i) => {
            const done = state.completed.includes(l.id);
            const unlocked = i === 0 || state.completed.includes(LESSONS[i - 1].id);
            const current = unlocked && !done;
            const offset = [44, 104, 154, 104, 44][i % 5];
            return (
              <div key={l.id} className="fadeup" style={{ display: "flex", alignItems: "center", gap: 14, height: 96, marginLeft: offset - 34, position: "relative", animationDelay: `${i * 70}ms` }}>
                <button className={`ww-btn ${unlocked ? "btn3d" : ""}`} onClick={() => unlocked && onStartLesson(l)} style={{
                  width: 66, height: 66, borderRadius: 24, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  background: done ? "linear-gradient(135deg,#3DD688,#1FA864)" : current ? GRAD : "rgba(255,255,255,.10)",
                  backdropFilter: unlocked ? "none" : "blur(10px)", WebkitBackdropFilter: unlocked ? "none" : "blur(10px)",
                  border: current || done ? "none" : "1px solid rgba(255,255,255,.18)",
                  boxShadow: done ? "inset 0 2px 1.5px rgba(255,255,255,.45), 0 10px 24px -8px rgba(31,168,100,.6)" : current ? "inset 0 2px 1.5px rgba(255,255,255,.5), 0 0 30px rgba(124,92,255,.65), 0 12px 26px -8px rgba(0,0,0,.5)" : "inset 0 1px 1px rgba(255,255,255,.2)",
                  color: "#fff", cursor: unlocked ? "pointer" : "default",
                }}>
                  {done ? <Check size={28} strokeWidth={3} /> : unlocked ? <l.Icon size={26} /> : <Lock size={22} color="rgba(255,255,255,.5)" />}
                </button>
                <div onClick={() => unlocked && onStartLesson(l)} style={{ cursor: unlocked ? "pointer" : "default" }}>
                  <div className="baloo" style={{ fontWeight: 800, fontSize: 16, color: unlocked ? "#fff" : "rgba(255,255,255,.4)" }}>{l.title}</div>
                  <div style={{ fontSize: 12, color: unlocked ? "rgba(255,255,255,.6)" : "rgba(255,255,255,.3)", fontWeight: 600 }}>{l.subtitle} · {l.vocab.length} kelime</div>
                  {current && <Chip color={C.violet} bg={C.yellow} style={{ marginTop: 5, padding: "4px 11px", fontSize: 11 }}>BAŞLA <ChevronRight size={12} /></Chip>}
                </div>
              </div>
            );
          })}
          <svg style={{ position: "absolute", bottom: -4, left: "-6%", width: "112%" }} viewBox="0 0 400 90" preserveAspectRatio="none">
            <path d="M0 90 L0 55 L70 18 L130 58 L200 10 L270 60 L330 28 L400 62 L400 90 Z" fill="rgba(124,92,255,.18)" />
            <path d="M0 90 L0 70 L90 40 L170 74 L250 34 L330 72 L400 48 L400 90 Z" fill="rgba(91,69,246,.30)" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ---------------------- DERS GİRİŞ EKRANI (ipucu + kelime önizleme) ---------------------- */
function LessonIntro({ lesson, onStart, onExit }) {
  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column", padding: 22, position: "relative", zIndex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button className="ww-btn glass" onClick={onExit} style={{ width: 40, height: 40, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", color: C.violet }}><X size={19} /></button>
        <div className="baloo" style={{ fontSize: 20, fontWeight: 800 }}>{lesson.title} <span style={{ color: C.gray, fontWeight: 600, fontSize: 14 }}>· {lesson.subtitle}</span></div>
      </div>

      <div className="fadeup" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 14 }}>
        {/* Gramer ipucu — Türkçe mikro-açıklama */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ width: 36, height: 36, borderRadius: 13, background: "rgba(255,196,61,.3)", boxShadow: "inset 0 1px 1px rgba(255,255,255,.85)", display: "flex", alignItems: "center", justifyContent: "center" }}><Lightbulb size={18} color="#C98C0F" /></span>
            <span className="baloo" style={{ fontWeight: 800, fontSize: 16.5 }}>{lesson.grammar.title}</span>
          </div>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "#4A4668", fontWeight: 500 }}>{lesson.grammar.body}</p>
        </div>

        {/* Kelime önizleme — artikel renkleriyle */}
        <div className="card" style={{ padding: "14px 16px" }}>
          <div className="baloo" style={{ fontWeight: 800, fontSize: 14, color: C.gray, marginBottom: 10, letterSpacing: .5 }}>BU DERSTE ({lesson.vocab.length} KELİME)</div>
          {lesson.vocab.map((v, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: i < lesson.vocab.length - 1 ? "1px solid rgba(30,27,58,.07)" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button className="ww-btn" onClick={() => speak(fullDe(v))} style={{ width: 30, height: 30, borderRadius: 10, background: "rgba(233,230,255,.7)", boxShadow: "inset 0 1px 1px rgba(255,255,255,.9)", display: "flex", alignItems: "center", justifyContent: "center" }}><Volume2 size={14} color={C.purple} /></button>
                <ArtWord v={v} size={15.5} />
              </div>
              <span style={{ fontSize: 13.5, color: C.gray, fontWeight: 600 }}>{v.tr}</span>
            </div>
          ))}
        </div>

        {Object.values(ART).length > 0 && lesson.vocab.some((v) => v.art) && (
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            {Object.entries(ART).map(([a, col]) => (
              <Chip key={a} color={col} bg="rgba(255,255,255,.5)" style={{ fontSize: 12 }}>● {a} <span style={{ color: C.gray, fontWeight: 600 }}>{ART_TR[a]}</span></Chip>
            ))}
          </div>
        )}
      </div>

      <Btn onClick={onStart} style={{ marginBottom: 10 }}>Derse başla</Btn>
    </div>
  );
}

/* ---------------------- DERS OYNATICI v3 ---------------------- */
function SpeakerBtn({ text, size = 46 }) {
  return (
    <button className="ww-btn btn3d" onClick={() => speak(text)} style={{
      width: size, height: size, borderRadius: size * 0.34, background: GRAD, color: "#fff",
      boxShadow: "inset 0 2px 1.5px rgba(255,255,255,.5), inset 0 -2px 3px rgba(0,0,0,.18), 0 12px 26px -8px rgba(91,69,246,.55)", flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}><Volume2 size={size * 0.46} /></button>
  );
}

function ExercisePlayer({ exercises, onExit, onFinish, heading }) {
  const [queue, setQueue] = useState(exercises);
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState(null);
  const [built, setBuilt] = useState([]);
  const [checked, setChecked] = useState(null);
  const [results, setResults] = useState([]);
  const ex = queue[idx];

  useEffect(() => { if (ex && ex.type === "listen") setTimeout(() => speak(ex.prompt), 350); }, [idx]);

  const check = () => {
    const ok = ex.type === "build" ? built.join(" ") === ex.answer.join(" ") : sel === ex.answer;
    setChecked(ok ? "right" : "wrong");
    if (!ex.retry) setResults((r) => [...r, { type: ex.type, ok, key: ex.key, why: ex.why, prompt: ex.type === "build" ? ex.tr : ex.prompt, answer: ex.type === "build" ? ex.answer.join(" ") : ex.answer }]);
    if (!ok && !ex.retry) setQueue((q) => [...q, { ...ex, retry: true, options: ex.options ? shuffle(ex.options) : undefined, words: ex.words ? shuffle(ex.words) : undefined }]);
    if (ok) speak(ex.type === "build" ? ex.answer.join(" ") : ex.type === "artikel" ? `${ex.answer} ${ex.prompt}` : ex.type === "tr2de" ? ex.answer : ex.prompt);
  };
  const nextQ = () => {
    if (idx + 1 >= queue.length) onFinish(results);
    else { setIdx(idx + 1); setSel(null); setBuilt([]); setChecked(null); }
  };
  const typeLabel = { de2tr: "Türkçesini seç", tr2de: "Almancasını seç", listen: "Dinle ve anlamını seç", build: "Cümleyi kur", artikel: "Doğru artikeli seç", lesen: "Oku ve cevapla" }[ex.type];
  const sectionChanged = ex.section && (idx === 0 || queue[idx - 1].section !== ex.section);

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column", padding: 22, position: "relative", zIndex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button className="ww-btn glass" onClick={onExit} style={{ width: 40, height: 40, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", color: C.violet }}><X size={19} /></button>
        <SegmentProgress step={idx - 1 + (checked ? 1 : 0)} total={queue.length} />
        <Chip color={C.purple} bg="rgba(255,255,255,.5)" style={{ padding: "5px 11px" }}>{idx + 1}/{queue.length}</Chip>
      </div>

      <div key={idx} className="fadeup" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {ex.section && (
          <div className={sectionChanged ? "pop" : ""} style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <Chip color="#fff" bg={C.violet} style={{ fontSize: 12, letterSpacing: .5 }}><GraduationCap size={13} /> {ex.section}</Chip>
          </div>
        )}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Chip color={C.purple} bg="rgba(233,230,255,.65)" style={{ boxShadow: "none", border: "none", textTransform: "uppercase", letterSpacing: 1, fontSize: 11.5 }}>{typeLabel}</Chip>
          {ex.retry && <Chip color="#C98C0F" bg="rgba(255,196,61,.25)" style={{ boxShadow: "none", border: "none", fontSize: 11 }}>Tekrar</Chip>}
        </div>

        {ex.type === "lesen" && (
          <div className="card" style={{ padding: 16, margin: "14px 0 6px" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.gray, letterSpacing: 1, marginBottom: 6 }}>METİN</div>
            <p className="baloo" style={{ margin: 0, fontSize: 16.5, lineHeight: 1.55, fontWeight: 600 }}>{ex.text}</p>
          </div>
        )}

        {ex.type === "listen" ? (
          <div className="card" style={{ display: "flex", alignItems: "center", gap: 16, margin: "14px 0 20px", padding: 18 }}>
            <SpeakerBtn text={ex.prompt} size={64} />
            <span style={{ color: C.gray, fontSize: 14, fontWeight: 600 }}>Tekrar dinlemek<br />için dokun</span>
          </div>
        ) : ex.type === "build" ? (
          <div className="baloo" style={{ fontSize: 26, fontWeight: 800, margin: "12px 0 16px", letterSpacing: -0.4 }}>"{ex.tr}"</div>
        ) : ex.type === "artikel" ? (
          <div style={{ margin: "12px 0 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <div className="baloo" style={{ fontSize: 34, fontWeight: 800, letterSpacing: -0.5 }}><span style={{ color: "#B8B2D9" }}>___</span> {ex.prompt}</div>
            <SpeakerBtn text={ex.prompt} size={42} />
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 14, margin: ex.type === "lesen" ? "12px 0 16px" : "12px 0 20px" }}>
            <div className="baloo" style={{ fontSize: ex.type === "lesen" ? 19 : 28, fontWeight: 800, letterSpacing: -0.4 }}>{ex.prompt}</div>
            {ex.type === "de2tr" && <SpeakerBtn text={ex.prompt} />}
          </div>
        )}

        {ex.type === "build" ? (
          <>
            <div style={{ minHeight: 60, borderBottom: "2px dashed #D8D3F2", display: "flex", flexWrap: "wrap", gap: 8, padding: "6px 0 14px", marginBottom: 20 }}>
              {built.map((w, i) => (
                <button key={i} className="ww-btn btn3d baloo" disabled={!!checked} onClick={() => setBuilt(built.filter((_, j) => j !== i))}
                  style={{ padding: "10px 15px", borderRadius: 14, background: GRAD, color: "#fff", fontWeight: 700, fontSize: 16, boxShadow: "inset 0 1.5px 1px rgba(255,255,255,.45), 0 8px 18px -6px rgba(91,69,246,.5)" }}>{w}</button>
              ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ex.words.map((w, i) => {
                const used = built.filter((b) => b === w).length >= ex.words.slice(0, i + 1).filter((b) => b === w).length;
                return (
                  <button key={i} className="ww-btn btn3d baloo" disabled={used || !!checked} onClick={() => setBuilt([...built, w])}
                    style={{ padding: "10px 15px", borderRadius: 14, background: used ? "rgba(233,230,248,.5)" : "rgba(255,255,255,.5)", border: "1px solid rgba(255,255,255,.6)", color: used ? "transparent" : C.violet, fontWeight: 700, fontSize: 16, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", boxShadow: used ? "none" : "inset 0 1.5px 1px rgba(255,255,255,.9), 0 8px 18px -8px rgba(30,27,58,.2)" }}>{w}</button>
                );
              })}
            </div>
          </>
        ) : ex.type === "artikel" ? (
          <div style={{ display: "flex", gap: 10 }}>
            {ex.options.map((o) => {
              const isSel = sel === o;
              const showState = checked && (o === ex.answer ? "right" : isSel ? "wrong" : null);
              return (
                <button key={o} className="ww-btn ww-opt baloo" disabled={!!checked} onClick={() => setSel(o)} style={{
                  flex: 1, padding: "20px 0", borderRadius: 22, fontSize: 21, fontWeight: 800, color: ART[o],
                  background: showState === "right" ? "rgba(231,248,239,.8)" : showState === "wrong" ? "rgba(253,234,234,.8)" : "rgba(255,255,255,.45)",
                  backdropFilter: "blur(22px) saturate(1.7)", WebkitBackdropFilter: "blur(22px) saturate(1.7)",
                  border: `2.5px solid ${showState === "right" ? C.green : showState === "wrong" ? C.red : isSel ? ART[o] : "rgba(255,255,255,.55)"}`,
                  boxShadow: isSel && !checked ? `inset 0 1.5px 1px rgba(255,255,255,.9), 0 14px 30px -8px ${ART[o]}55` : "inset 0 1.5px 1px rgba(255,255,255,.9), 0 8px 20px -8px rgba(30,27,58,.16)",
                }}>{o}</button>
              );
            })}
          </div>
        ) : (
          ex.options.map((o) => {
            const isSel = sel === o;
            const showState = checked && (o === ex.answer ? "right" : isSel ? "wrong" : null);
            return (
              <button key={o} className="ww-btn ww-opt" disabled={!!checked} onClick={() => setSel(o)} style={{
                width: "100%", textAlign: "left", padding: "15px 18px", borderRadius: 20, fontSize: 16, fontFamily: "Inter",
                fontWeight: 700, marginBottom: 10, color: C.violet,
                background: showState === "right" ? "rgba(231,248,239,.75)" : showState === "wrong" ? "rgba(253,234,234,.75)" : "rgba(255,255,255,.45)",
                backdropFilter: "blur(22px) saturate(1.7)", WebkitBackdropFilter: "blur(22px) saturate(1.7)",
                border: `2px solid ${showState === "right" ? C.green : showState === "wrong" ? C.red : isSel ? C.purple : "rgba(255,255,255,.55)"}`,
                boxShadow: isSel && !checked ? "inset 0 1.5px 1px rgba(255,255,255,.9), 0 14px 30px -8px rgba(91,69,246,.35)" : "inset 0 1.5px 1px rgba(255,255,255,.9), 0 8px 20px -8px rgba(30,27,58,.16)",
              }}>{o}</button>
            );
          })
        )}
      </div>

      {checked ? (
        <div className="pop glass" style={{ margin: "0 -8px", padding: 18, borderRadius: 26 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: ex.why ? 8 : 10 }}>
            <span style={{ width: 34, height: 34, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: checked === "right" ? "#E7F8EF" : "#FDEAEA", flexShrink: 0 }}>
              {checked === "right" ? <Check size={19} color="#1F9A5B" strokeWidth={3} /> : <X size={19} color={C.red} strokeWidth={3} />}
            </span>
            <div>
              <div className="baloo" style={{ fontWeight: 800, fontSize: 17, color: checked === "right" ? "#1F9A5B" : C.red, lineHeight: 1.1 }}>
                {checked === "right" ? "Süper!" : "Olmadı — sorun değil"}
              </div>
              {checked === "wrong" && <div style={{ fontSize: 13 }}>Doğru cevap: <b>{ex.type === "build" ? ex.answer.join(" ") : ex.answer}</b>{!ex.retry && <span style={{ color: C.gray }}> · Bu soru sona eklendi, tekrar geleceksin.</span>}</div>}
            </div>
          </div>
          {ex.why && (checked === "wrong" || ex.type === "artikel" || ex.type === "build") && (
            <div style={{ fontSize: 13, color: "#4A4668", background: "rgba(255,196,61,.18)", borderRadius: 13, padding: "9px 12px", marginBottom: 12, display: "flex", gap: 8, fontWeight: 500, lineHeight: 1.5 }}>
              <Lightbulb size={15} color="#C98C0F" style={{ flexShrink: 0, marginTop: 2 }} /> <span>{ex.why}</span>
            </div>
          )}
          <Btn variant={checked === "right" ? "green" : "primary"} onClick={nextQ}>Devam</Btn>
        </div>
      ) : (
        <Btn onClick={check} disabled={ex.type === "build" ? built.length === 0 : !sel} style={{ marginBottom: 6 }}>Kontrol et</Btn>
      )}
    </div>
  );
}

function LessonComplete({ results, title, onClose }) {
  const correct = results.filter((r) => r.ok).length;
  const xp = correct * 2 + 4;
  const pct = results.length ? Math.round((correct / results.length) * 100) : 100;
  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center", background: NIGHT, position: "relative", overflow: "hidden" }}>
      {STARS.map((st, i) => (
        <span key={i} className="star" style={{ position: "absolute", left: `${st.left}%`, top: `${st.top}%`, width: st.s, height: st.s, borderRadius: "50%", background: "#fff", opacity: .4, animation: `twinkle ${st.d}s ease-in-out infinite` }} />
      ))}
      <div className="pop" style={{ position: "relative" }}>
        <div style={{ position: "absolute", inset: -30, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,196,61,.3), transparent 65%)" }} />
        <Wolli size={150} wave />
      </div>
      <div className="baloo" style={{ fontSize: 32, fontWeight: 800, marginTop: 12, color: "#fff", letterSpacing: -0.5 }}>Tolle Arbeit! 🎉</div>
      <p style={{ color: "rgba(255,255,255,.65)", marginTop: 2, fontWeight: 600 }}>"{title}" tamamlandı</p>
      <div style={{ display: "flex", gap: 12, margin: "26px 0 30px" }}>
        <div className="pop glass-dark" style={{ borderRadius: 26, padding: "16px 26px" }}>
          <div className="baloo" style={{ fontSize: 30, fontWeight: 800, color: C.yellow }}>+{xp}</div>
          <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.7)", fontWeight: 700, letterSpacing: 1 }}>XP</div>
        </div>
        <div className="pop glass-dark" style={{ borderRadius: 26, padding: "16px 26px", animationDelay: ".08s" }}>
          <div className="baloo" style={{ fontSize: 30, fontWeight: 800, color: "#3DD688" }}>{pct}%</div>
          <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.7)", fontWeight: 700, letterSpacing: 1 }}>DOĞRULUK</div>
        </div>
      </div>
      <div style={{ width: "100%", maxWidth: 320 }}><Btn variant="green" onClick={() => onClose(xp)}>Devam et</Btn></div>
    </div>
  );
}

/* ---------------------- KELİMELER v3: SRS + DESTE ---------------------- */
function VocabCards({ state, onStartReview }) {
  const unlockedVocab = useMemo(() => unlockedLessons(state).flatMap((l) => l.vocab.map((v) => ({ ...v, lesson: l.title, key: fullDe(v) }))), [state.completed]);
  const due = getDueWords(state);
  const known = knownWordCount(state);
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);
  const v = unlockedVocab[i % unlockedVocab.length];
  const stat = state.wordStats[v.key];

  return (
    <div style={{ padding: "16px 20px 130px", textAlign: "center", position: "relative", zIndex: 1 }}>
      <div className="baloo" style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.4, display: "flex", alignItems: "center", justifyContent: "center", gap: 9 }}>
        <WalletCards size={24} color={C.purple} /> Kelimeler
      </div>
      <div style={{ fontSize: 13, color: C.gray, margin: "4px 0 16px", fontWeight: 600 }}>{unlockedVocab.length} kelime açık · {known} kelime hafızanda</div>

      {/* SRS tekrar kartı */}
      <div className="card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, marginBottom: 22, textAlign: "left" }}>
        <Ring size={56} stroke={6.5} value={(known / Math.max(1, unlockedVocab.length)) * 100} color={C.green}>
          <RotateCcw size={19} color={due.length ? "#C98C0F" : C.green} />
        </Ring>
        <div style={{ flex: 1 }}>
          <div className="baloo" style={{ fontWeight: 800, fontSize: 15 }}>{due.length ? `${due.length} kelime tekrar bekliyor` : "Tekrar kuyruğun temiz 🎉"}</div>
          <div style={{ fontSize: 12, color: C.gray, fontWeight: 600 }}>Akıllı tekrar, kelimeleri tam unutmak üzereyken getirir.</div>
        </div>
        {due.length > 0 && (
          <button className="ww-btn btn3d baloo" onClick={onStartReview} style={{ padding: "10px 14px", borderRadius: 15, background: GRAD, color: "#fff", fontWeight: 800, fontSize: 13.5, boxShadow: "inset 0 1.5px 1px rgba(255,255,255,.45), 0 10px 22px -8px rgba(91,69,246,.5)" }}>Başlat</button>
        )}
      </div>

      {/* deste */}
      <div style={{ position: "relative", maxWidth: 320, margin: "0 auto" }}>
        <div className="card" style={{ position: "absolute", inset: "0 8px", top: 18, height: 240, transform: "rotate(3.5deg)", opacity: .5 }} />
        <div className="card" style={{ position: "absolute", inset: "0 4px", top: 9, height: 240, transform: "rotate(-2.5deg)", opacity: .75 }} />
        <div onClick={() => setFlip(!flip)} style={{ perspective: 1100, cursor: "pointer", position: "relative" }}>
          <div style={{ position: "relative", height: 240, transformStyle: "preserve-3d", transition: "transform .5s cubic-bezier(.4,1.4,.6,1)", transform: flip ? "rotateY(180deg)" : "none" }}>
            <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", borderRadius: 28, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, background: GRAD, color: "#fff", boxShadow: "0 24px 50px -14px rgba(91,69,246,.55)", overflow: "hidden" }}>
              <span style={{ position: "absolute", top: -50, right: -50, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,.12)" }} />
              <Chip color="#fff" bg="rgba(255,255,255,.16)" style={{ border: "1px solid rgba(255,255,255,.25)", boxShadow: "none", fontSize: 11 }}>🇩🇪 ALMANCA</Chip>
              <ArtWord v={v} size={31} light />
              <div style={{ fontSize: 12, opacity: .8, fontWeight: 600 }}>{v.lesson}{stat ? ` · Kutu ${stat.box + 1}/5` : ""}</div>
            </div>
            <div className="card" style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", borderRadius: 28, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <Chip color={C.purple} bg="rgba(233,230,255,.65)" style={{ boxShadow: "none", border: "none", fontSize: 11 }}>🇹🇷 TÜRKÇE</Chip>
              <div className="baloo" style={{ fontSize: 32, fontWeight: 800, color: C.purple, letterSpacing: -0.5 }}>{v.tr}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 30, alignItems: "center" }}>
        <button className="ww-btn btn3d glass" onClick={() => { setFlip(false); setI((i - 1 + unlockedVocab.length) % unlockedVocab.length); }}
          style={{ width: 54, height: 54, borderRadius: 19, display: "flex", alignItems: "center", justifyContent: "center", color: C.violet }}><ArrowLeft size={22} /></button>
        <button className="ww-btn btn3d" onClick={() => speak(fullDe(v))} style={{ width: 64, height: 64, borderRadius: 22, background: "linear-gradient(135deg,#FFD46B,#F5AE17)", boxShadow: "inset 0 2px 1.5px rgba(255,255,255,.6), inset 0 -2px 3px rgba(0,0,0,.15), 0 14px 28px -8px rgba(245,174,23,.6)", display: "flex", alignItems: "center", justifyContent: "center" }}><Volume2 size={26} color={C.violet} /></button>
        <button className="ww-btn btn3d" onClick={() => { setFlip(false); setI((i + 1) % unlockedVocab.length); }}
          style={{ width: 54, height: 54, borderRadius: 18, background: GRAD, color: "#fff", boxShadow: "inset 0 2px 1.5px rgba(255,255,255,.5), inset 0 -2px 3px rgba(0,0,0,.18), 0 12px 26px -8px rgba(91,69,246,.55)", display: "flex", alignItems: "center", justifyContent: "center" }}><ArrowRight size={22} /></button>
      </div>
      <Chip color={C.gray} bg="rgba(255,255,255,.5)" style={{ marginTop: 18 }}>{(i % unlockedVocab.length) + 1} / {unlockedVocab.length}</Chip>
    </div>
  );
}

/* ---------------------- AI SESLİ SOHBET v2: ORB + CHIPS ---------------------- */
const STARTER_CHIPS = ["Mir geht es gut!", "Wie heißt du?", "Guten Morgen!", "Danke!"];

function AIChat() {
  const [msgs, setMsgs] = useState([
    { role: "assistant", de: "Hallo! Ich bin Wolli. Wie geht es dir?", tr: "Merhaba! Ben Wolli. Nasılsın?", tip: "Aşağıdaki önerilere dokunarak hızlıca cevap verebilirsin." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const endRef = useRef(null);
  const hasSR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const showChips = msgs.filter((m) => m.role === "user").length === 0;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);

  const startMic = () => {
    if (!hasSR) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "de-DE"; rec.interimResults = false;
    rec.onresult = (e) => { const t = e.results[0][0].transcript; setListening(false); send(t); };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    setListening(true); rec.start();
  };

  const send = async (forced) => {
    const text = (forced ?? input).trim();
    if (!text || busy) return;
    const newMsgs = [...msgs, { role: "user", de: text }];
    setMsgs(newMsgs); setInput(""); setBusy(true);
    try {
      const history = newMsgs.map((m) => ({
        role: m.role,
        content: m.role === "user" ? m.de : JSON.stringify({ de: m.de, tr: m.tr, tip: m.tip }),
      }));
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `Sen Wolli'sin: Türk öğrencilere Almanca öğreten sevimli, sabırlı bir baykuş öğretmensin. Öğrencinin seviyesi: başlangıç (A1). Kısa ve basit Almanca cümlelerle sohbet et. Öğrenci hata yaparsa nazikçe düzelt. SADECE şu JSON formatında yanıt ver, başka hiçbir şey yazma: {"de":"Almanca cevabın (1-2 kısa cümle)","tr":"Türkçe çevirisi","tip":"Türkçe kısa ipucu veya düzeltme (öğrencinin hatası varsa belirt, yoksa nasıl cevap verebileceğine dair ipucu)"}`,
          messages: history,
        }),
      });
      const data = await res.json();
      const raw = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
      let parsed;
      try { parsed = JSON.parse(raw.replace(/```json|```/g, "").trim()); }
      catch { parsed = { de: raw, tr: "", tip: "" }; }
      setMsgs((m) => [...m, { role: "assistant", ...parsed }]);
      if (parsed.de) speak(parsed.de);
    } catch (e) {
      setMsgs((m) => [...m, { role: "assistant", de: "Entschuldigung!", tr: "Bağlantı hatası oldu, tekrar dener misin?", tip: "" }]);
    }
    setBusy(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 160px)", padding: "0 16px", position: "relative", zIndex: 1 }}>
      <div style={{ textAlign: "center", padding: "12px 0 10px" }}>
        <div className="baloo" style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.4, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <span style={{ width: 30, height: 30, borderRadius: 11, background: GRAD, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Mic size={16} color="#fff" /></span>
          AI Sesli Sohbet
        </div>
        <div style={{ fontSize: 12.5, color: C.gray, fontWeight: 600 }}>Wolli ile Almanca pratik — sesli veya yazılı</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 8 }}>
        {msgs.map((m, i) => (
          <div key={i} className="fadeup" style={{ display: "flex", gap: 8, marginBottom: 14, flexDirection: m.role === "user" ? "row-reverse" : "row", alignItems: "flex-end" }}>
            {m.role === "assistant" && <Wolli size={40} />}
            <div style={{ maxWidth: "78%" }}>
              <div style={{
                padding: "12px 15px", fontSize: 15, lineHeight: 1.45,
                background: m.role === "user" ? GRAD : "rgba(255,255,255,.45)",
                backdropFilter: m.role === "user" ? "none" : "blur(24px) saturate(1.8)",
                WebkitBackdropFilter: m.role === "user" ? "none" : "blur(24px) saturate(1.8)",
                border: m.role === "user" ? "none" : "1px solid rgba(255,255,255,.55)",
                color: m.role === "user" ? "#fff" : C.violet,
                borderRadius: m.role === "user" ? "22px 22px 6px 22px" : "22px 22px 22px 6px",
                boxShadow: m.role === "user" ? "inset 0 1.5px 1px rgba(255,255,255,.4), 0 12px 26px -8px rgba(91,69,246,.5)" : "inset 0 1.5px 1px rgba(255,255,255,.9), 0 10px 24px -10px rgba(30,27,58,.18)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="baloo" style={{ fontWeight: 700 }}>{m.de}</span>
                  {m.role === "assistant" && (
                    <button className="ww-btn" onClick={() => speak(m.de)} style={{ background: C.lavSoft, borderRadius: 9, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Volume2 size={14} color={C.purple} /></button>
                  )}
                </div>
                {m.tr && <div style={{ fontSize: 13, color: m.role === "user" ? "rgba(255,255,255,.8)" : C.gray, marginTop: 4 }}>{m.tr}</div>}
              </div>
              {m.tip && (
                <div style={{ fontSize: 12, color: C.purple, background: "rgba(233,230,255,.65)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", boxShadow: "inset 0 1px 1px rgba(255,255,255,.8)", borderRadius: 13, padding: "7px 11px", marginTop: 6, display: "flex", gap: 6, fontWeight: 600 }}>
                  <Lightbulb size={13} style={{ flexShrink: 0, marginTop: 1.5 }} /> {m.tip}
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", color: C.gray, fontSize: 13, fontWeight: 600 }}>
            <Wolli size={36} />
            <span className="glass" style={{ padding: "8px 14px", borderRadius: 16 }}>Wolli düşünüyor...</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {showChips && (
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 10 }}>
          {STARTER_CHIPS.map((c) => (
            <Chip key={c} onClick={() => send(c)} color={C.purple} bg="rgba(255,255,255,.55)" style={{ whiteSpace: "nowrap", flexShrink: 0 }}>
              <Sparkles size={12} /> {c}
            </Chip>
          ))}
        </div>
      )}

      <div className="glass" style={{ display: "flex", gap: 8, padding: 8, borderRadius: 24, marginBottom: 10, alignItems: "center" }}>
        {hasSR && (
          <button className="ww-btn orb" onClick={startMic} style={{
            width: 48, height: 48, borderRadius: "50%", flexShrink: 0, position: "relative", overflow: "hidden",
            background: listening ? "conic-gradient(from 0deg, #7C5CFF, #60B5FF, #FFC43D, #7C5CFF)" : GRAD,
            animation: listening ? "orbpulse 1.4s infinite" : "none",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
            boxShadow: "0 6px 18px -4px rgba(91,69,246,.6)",
          }}>
            {listening && <span style={{ position: "absolute", inset: -12, background: "conic-gradient(from 0deg, #7C5CFF, #60B5FF, #FFC43D, #7C5CFF)", animation: "orbspin 1.6s linear infinite", filter: "blur(10px)", opacity: .9 }} />}
            <Mic size={21} style={{ position: "relative" }} />
          </button>
        )}
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={listening ? "Dinliyorum... Almanca konuş!" : "Almanca yaz..."}
          style={{ flex: 1, padding: "12px 6px", border: "none", fontSize: 15, fontFamily: "Inter", fontWeight: 600, outline: "none", color: C.violet, background: "transparent" }} />
        <button className="ww-btn btn3d" onClick={() => send()} disabled={busy || !input.trim()} style={{
          width: 48, height: 48, borderRadius: 18, flexShrink: 0,
          background: busy || !input.trim() ? "rgba(124,92,255,.25)" : GRAD, color: "#fff",
          boxShadow: busy || !input.trim() ? "inset 0 1px 1px rgba(255,255,255,.5)" : "inset 0 2px 1.5px rgba(255,255,255,.5), inset 0 -2px 3px rgba(0,0,0,.18), 0 12px 26px -8px rgba(91,69,246,.55)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}><Send size={20} /></button>
      </div>
    </div>
  );
}

/* ---------------------- SINAV v3: GOETHE + MİNİ ---------------------- */
const TYPE_TR = { de2tr: "Çeviri (DE→TR)", tr2de: "Çeviri (TR→DE)", listen: "Dinleme (Hören)", lesen: "Okuma (Lesen)", artikel: "Artikel", build: "Cümle kurma" };

function ExamHome({ state, onStart }) {
  const last = state.examHistory[state.examHistory.length - 1];
  return (
    <div style={{ padding: "16px 16px 130px", position: "relative", zIndex: 1 }}>
      <div className="baloo" style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.4, display: "flex", alignItems: "center", gap: 9, margin: "0 4px 4px" }}>
        <ClipboardList size={24} color={C.purple} /> Sınav Pratiği
      </div>
      <div style={{ fontSize: 13.5, color: C.gray, margin: "0 4px 16px", fontWeight: 600 }}>Gerçek sınav formatında pratik yap, beceri analizini gör.</div>

      {/* Goethe A1 deneme — ana kart */}
      <div style={{ borderRadius: 30, background: NIGHT, padding: 22, position: "relative", overflow: "hidden", boxShadow: "0 24px 50px -18px rgba(30,27,58,.55)" }}>
        {STARS.slice(0, 14).map((st, i) => (
          <span key={i} className="star" style={{ position: "absolute", left: `${st.left}%`, top: `${st.top}%`, width: st.s, height: st.s, borderRadius: "50%", background: "#fff", opacity: .4, animation: `twinkle ${st.d}s ease-in-out infinite` }} />
        ))}
        <div style={{ position: "relative" }}>
          <Chip color={C.violet} bg={C.yellow} style={{ boxShadow: "none", fontSize: 11 }}><GraduationCap size={13} /> GOETHE A1 FORMATI</Chip>
          <div className="baloo" style={{ color: "#fff", fontSize: 26, fontWeight: 800, margin: "10px 0 4px", letterSpacing: -0.5 }}>Goethe A1 Denemesi</div>
          <div style={{ color: "rgba(255,255,255,.65)", fontSize: 13.5, marginBottom: 6, fontWeight: 600 }}>Hören (Dinleme) + Lesen (Okuma) bölümleri</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            <span className="glass-dark" style={{ padding: "5px 11px", borderRadius: 99, color: "#fff", fontSize: 11.5, fontWeight: 700 }}>🎧 5 Hören</span>
            <span className="glass-dark" style={{ padding: "5px 11px", borderRadius: 99, color: "#fff", fontSize: 11.5, fontWeight: 700 }}>📄 5 Lesen</span>
            <span className="glass-dark" style={{ padding: "5px 11px", borderRadius: 99, color: "#fff", fontSize: 11.5, fontWeight: 700 }}>Geçme: %60</span>
          </div>
          <Btn variant="green" onClick={() => onStart("goethe")}>Denemeye başla</Btn>
        </div>
      </div>

      {/* Mini sınav */}
      <div className="card" style={{ padding: 18, marginTop: 14, display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ width: 46, height: 46, borderRadius: 16, background: "rgba(233,230,255,.7)", boxShadow: "inset 0 1px 1px rgba(255,255,255,.85)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Target size={21} color={C.purple} />
        </span>
        <div style={{ flex: 1 }}>
          <div className="baloo" style={{ fontWeight: 800, fontSize: 15.5 }}>Mini Sınav</div>
          <div style={{ fontSize: 12.5, color: C.gray, fontWeight: 600 }}>10 karışık soru: çeviri, artikel, dinleme.</div>
        </div>
        <button className="ww-btn btn3d baloo" onClick={() => onStart("mini")} style={{ padding: "10px 16px", borderRadius: 16, background: GRAD, color: "#fff", fontWeight: 800, fontSize: 14, boxShadow: "inset 0 1.5px 1px rgba(255,255,255,.45), 0 10px 22px -8px rgba(91,69,246,.5)" }}>Başla</button>
      </div>

      {last && (
        <div className="card" style={{ padding: 16, marginTop: 12, display: "flex", alignItems: "center", gap: 16 }}>
          <Ring size={58} stroke={6.5} value={(last.score / last.total) * 100} color={last.score / last.total >= 0.6 ? C.green : C.red}>
            <span className="baloo" style={{ fontSize: 14.5, fontWeight: 800 }}>{last.score}/{last.total}</span>
          </Ring>
          <div>
            <div className="baloo" style={{ fontWeight: 800, fontSize: 15 }}>Son sınavın {last.mode === "goethe" ? "· Goethe" : "· Mini"}</div>
            <div style={{ fontSize: 12.5, color: C.gray, fontWeight: 600 }}>{last.date} · Toplam {state.examHistory.length} sınav çözdün</div>
          </div>
        </div>
      )}
    </div>
  );
}

function ExamResult({ results, mode, onClose, onRetry }) {
  const correct = results.filter((r) => r.ok).length;
  const pct = results.length ? Math.round((correct / results.length) * 100) : 0;
  const passed = pct >= 60;
  const byType = {};
  results.forEach((r) => {
    byType[r.type] = byType[r.type] || { ok: 0, total: 0 };
    byType[r.type].total++; if (r.ok) byType[r.type].ok++;
  });
  const wrong = results.filter((r) => !r.ok);
  const grade = mode === "goethe"
    ? (passed ? { t: "Bestanden! Geçtin 🎉", c: C.green } : { t: "Bu sefer olmadı", c: C.red })
    : pct >= 80 ? { t: "Harika!", c: C.green } : pct >= 50 ? { t: "İyi gidiyorsun!", c: "#E8A50F" } : { t: "Biraz daha pratik!", c: C.red };

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", padding: "28px 18px 50px", position: "relative", zIndex: 1 }}>
      <div className="card pop" style={{ padding: 22, display: "flex", alignItems: "center", gap: 18 }}>
        <Ring size={104} stroke={11} value={pct} color={grade.c}>
          <span className="baloo" style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{pct}<small style={{ fontSize: 14 }}>%</small></span>
        </Ring>
        <div>
          {mode === "goethe" && <Chip color={passed ? "#1F9A5B" : C.red} bg={passed ? "rgba(231,248,239,.8)" : "rgba(253,234,234,.8)"} style={{ fontSize: 11, marginBottom: 6 }}><GraduationCap size={13} /> GOETHE A1 · GEÇME %60</Chip>}
          <div className="baloo" style={{ fontSize: 22, fontWeight: 800, color: grade.c, letterSpacing: -0.4 }}>{grade.t}</div>
          <div style={{ fontSize: 13.5, color: C.gray, fontWeight: 600 }}>{correct} / {results.length} doğru</div>
          <Chip color={C.purple} bg="rgba(233,230,255,.65)" style={{ marginTop: 8, boxShadow: "none", border: "none" }}><Zap size={13} fill={C.purple} /> +{correct * 2} XP</Chip>
        </div>
        <div style={{ marginLeft: "auto", alignSelf: "flex-start" }}><Wolli size={52} /></div>
      </div>

      <div className="baloo" style={{ fontWeight: 800, fontSize: 17, margin: "22px 4px 10px", display: "flex", alignItems: "center", gap: 8, letterSpacing: -0.3 }}>
        <BarChart3 size={19} color={C.purple} /> Beceri analizi
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(3, Object.keys(byType).length)},1fr)`, gap: 10 }}>
        {Object.entries(byType).map(([t, v]) => {
          const p = (v.ok / v.total) * 100;
          const col = p >= 70 ? C.green : p >= 40 ? "#E8A50F" : C.red;
          return (
            <div key={t} className="card" style={{ padding: "14px 8px", textAlign: "center" }}>
              <Ring size={58} stroke={6.5} value={p} color={col}>
                <span className="baloo" style={{ fontSize: 13.5, fontWeight: 800 }}>{v.ok}/{v.total}</span>
              </Ring>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: C.gray, marginTop: 8 }}>{TYPE_TR[t]}</div>
            </div>
          );
        })}
      </div>

      {wrong.length > 0 && (
        <>
          <div className="baloo" style={{ fontWeight: 800, fontSize: 17, margin: "20px 4px 6px", display: "flex", alignItems: "center", gap: 8, letterSpacing: -0.3 }}>
            <RotateCcw size={18} color={C.purple} /> Tekrar etmen gerekenler
          </div>
          <div style={{ fontSize: 12, color: C.gray, fontWeight: 600, margin: "0 4px 10px" }}>Bu sorular hata defterine eklendi — Profil'den çalışabilirsin.</div>
          <div className="card" style={{ padding: "4px 16px" }}>
            {wrong.map((w, i) => (
              <div key={i} style={{ padding: "12px 0", borderBottom: i < wrong.length - 1 ? "1px solid rgba(30,27,58,.07)" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14.5 }}>
                  <span style={{ fontWeight: 600 }}>{w.prompt}</span>
                  <span style={{ color: C.green, fontWeight: 800 }}>{w.answer}</span>
                </div>
                {w.why && <div style={{ fontSize: 12, color: C.gray, marginTop: 4, lineHeight: 1.45 }}>💡 {w.why}</div>}
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
        <Btn variant="secondary" onClick={onClose}>Kapat</Btn>
        <Btn onClick={onRetry}>Tekrar dene</Btn>
      </div>
    </div>
  );
}

/* ---------------------- PROFİL v3: BENTO + HATA DEFTERİ ---------------------- */
function Profile({ state, onStudyMistakes }) {
  const level = Math.floor(state.xp / 50) + 1;
  const levelPct = ((state.xp % 50) / 50) * 100;
  const learned = knownWordCount(state);
  const cefr = cefrPct(state);
  const recentMistakes = [...state.mistakes].slice(-4).reverse();
  const badges = [
    { Ic: Medal, t: "İlk ders", on: state.completed.length >= 1 },
    { Ic: Flame, t: "3 gün seri", on: state.streak >= 3 },
    { Ic: BookOpen, t: "20 kelime", on: learned >= 20 },
    { Ic: Trophy, t: "İlk sınav", on: state.examHistory.length >= 1 },
    { Ic: Star, t: "Seviye 3", on: level >= 3 },
    { Ic: Award, t: "Tüm dersler", on: state.completed.length >= LESSONS.length },
  ];
  const Stat = ({ Ic, v, t, col, big }) => (
    <div className="card" style={{ padding: big ? 18 : 14, textAlign: "center", gridColumn: big ? "span 2" : "auto", display: "flex", flexDirection: big ? "row" : "column", alignItems: "center", justifyContent: "center", gap: big ? 16 : 4 }}>
      <span style={{ width: 38, height: 38, borderRadius: 13, background: `${col}18`, display: "flex", alignItems: "center", justifyContent: "center" }}><Ic size={19} color={col} /></span>
      <div>
        <div className="baloo" style={{ fontSize: big ? 28 : 23, fontWeight: 800, color: C.violet, lineHeight: 1.1 }}>{v}</div>
        <div style={{ fontSize: 11.5, color: C.gray, fontWeight: 700 }}>{t}</div>
      </div>
    </div>
  );
  return (
    <div style={{ padding: "16px 16px 130px", position: "relative", zIndex: 1 }}>
      <div style={{ borderRadius: 30, background: NIGHT, padding: 22, position: "relative", overflow: "hidden", boxShadow: "0 24px 50px -18px rgba(30,27,58,.55)", display: "flex", alignItems: "center", gap: 18 }}>
        {STARS.slice(0, 16).map((st, i) => (
          <span key={i} className="star" style={{ position: "absolute", left: `${st.left}%`, top: `${st.top}%`, width: st.s, height: st.s, borderRadius: "50%", background: "#fff", opacity: .4, animation: `twinkle ${st.d}s ease-in-out infinite` }} />
        ))}
        <Ring size={96} stroke={8} value={levelPct} color={C.yellow} track="rgba(255,255,255,.15)">
          <Wolli size={64} />
        </Ring>
        <div style={{ position: "relative" }}>
          <div className="baloo" style={{ color: "#fff", fontSize: 23, fontWeight: 800, letterSpacing: -0.4 }}>{state.name}</div>
          <div style={{ color: "rgba(255,255,255,.65)", fontSize: 12.5, fontWeight: 600, marginBottom: 8 }}>A1 yolculuğunun %{cefr}'i tamam</div>
          <Chip color={C.violet} bg={C.yellow} style={{ boxShadow: "none", fontSize: 11.5 }}><Star size={13} fill={C.violet} /> Seviye {level} · {50 - (state.xp % 50)} XP kaldı</Chip>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
        <Stat Ic={Zap} v={state.xp} t="Toplam XP" col={C.purple} big />
        <Stat Ic={Flame} v={state.streak} t="Günlük seri" col="#E8821E" />
        <Stat Ic={BookOpen} v={learned} t="Hafızadaki kelime" col={C.sky} />
        <Stat Ic={CheckCircle2} v={state.completed.length} t="Ders" col={C.green} />
        <Stat Ic={Target} v={state.examHistory.length} t="Sınav" col={C.red} />
      </div>

      {/* Hata defteri */}
      <div className="baloo" style={{ fontWeight: 800, fontSize: 17, margin: "20px 4px 10px", display: "flex", alignItems: "center", gap: 8, letterSpacing: -0.3 }}>
        <NotebookIcon /> Hata defteri
      </div>
      <div className="card" style={{ padding: "14px 16px" }}>
        {recentMistakes.length === 0 ? (
          <div style={{ fontSize: 13.5, color: C.gray, fontWeight: 600, textAlign: "center", padding: "8px 0" }}>Henüz hata yok — ya da hepsini çalıştın! 💪</div>
        ) : (
          <>
            {recentMistakes.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", fontSize: 14, borderBottom: i < recentMistakes.length - 1 ? "1px solid rgba(30,27,58,.07)" : "none" }}>
                <span style={{ fontWeight: 600 }}>{m.prompt}</span>
                <span style={{ color: C.green, fontWeight: 800 }}>{m.answer}</span>
              </div>
            ))}
            <div style={{ marginTop: 12 }}>
              <Btn variant="secondary" onClick={onStudyMistakes} style={{ padding: "12px 16px", fontSize: 15 }}>Hatalarımı çalış ({Math.min(state.mistakes.length, 8)})</Btn>
            </div>
          </>
        )}
      </div>

      <div className="baloo" style={{ fontWeight: 800, fontSize: 17, margin: "20px 4px 10px", display: "flex", alignItems: "center", gap: 8, letterSpacing: -0.3 }}>
        <Medal size={19} color={C.purple} /> Rozetler
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        {badges.map((b) => (
          <div key={b.t} className="card" style={{ padding: "14px 8px", textAlign: "center", opacity: b.on ? 1 : 0.45 }}>
            <span style={{ width: 44, height: 44, borderRadius: 16, margin: "0 auto", background: b.on ? GRAD : "#EEEBFA", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: b.on ? "0 8px 18px -6px rgba(91,69,246,.5)" : "none" }}>
              <b.Ic size={21} color={b.on ? "#fff" : "#A8A3C7"} />
            </span>
            <div style={{ fontSize: 11.5, fontWeight: 700, marginTop: 7, color: b.on ? C.violet : C.gray }}>{b.t}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
const NotebookIcon = () => <ClipboardList size={19} color={C.purple} />;

/* ---------------------- YÜZEN TAB BAR + ANA UYGULAMA ---------------------- */
const TABS = [
  { id: "home", Ic: Home, t: "Yol" },
  { id: "vocab", Ic: WalletCards, t: "Kelimeler" },
  { id: "chat", Ic: Mic, t: "Sohbet" },
  { id: "exam", Ic: ClipboardList, t: "Sınav" },
  { id: "profile", Ic: User, t: "Profil" },
];

export default function WortWegApp() {
  const [state, setState] = useState(null);
  const [tab, setTab] = useState("home");
  const [view, setView] = useState("main"); // main | lessonIntro | lesson | done | exam | examDone | review
  const [activeLesson, setActiveLesson] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [results, setResults] = useState([]);
  const [doneTitle, setDoneTitle] = useState("");
  const [examMode, setExamMode] = useState("mini");

  useEffect(() => { loadState().then(setState); }, []);
  useEffect(() => { try { window.speechSynthesis.getVoices(); } catch (e) {} }, []);

  const update = useCallback((patch) => {
    setState((s) => { const n = { ...s, ...patch }; saveState(n); return n; });
  }, []);

  const addXpPatch = (s, xp) => {
    const today = todayStr();
    const newStreak = s.lastDay === today ? s.streak : s.streak + 1;
    return { xp: s.xp + xp, todayXp: (s.lastDay === today ? s.todayXp : 0) + xp, lastDay: today, streak: Math.max(1, newStreak) };
  };

  /* Sonuçları işle: SRS güncelle + hata defteri */
  const applyResults = (s, res) => {
    let stats = s.wordStats;
    res.forEach((r) => { if (r.key) stats = bumpStat(stats, r.key, r.ok); });
    const newMistakes = res.filter((r) => !r.ok).map((r) => ({ prompt: r.prompt, answer: r.answer, why: r.why, type: r.type, key: r.key, date: todayStr() }));
    const merged = [...s.mistakes.filter((m) => !newMistakes.some((n) => n.prompt === m.prompt)), ...newMistakes].slice(-50);
    return { wordStats: stats, mistakes: merged };
  };

  const startReview = (words) => {
    const list = words || getDueWords(state);
    if (!list.length) return;
    setExercises(buildReview(list));
    setDoneTitle("Akıllı Tekrar");
    setView("review");
  };

  const startMistakes = () => {
    const keys = [...new Set(state.mistakes.map((m) => m.key).filter(Boolean))].slice(-8);
    const words = keys.map((k) => VOCAB_BY_KEY[k]).filter(Boolean);
    if (words.length) startReview(words);
  };

  const Shell = ({ children }) => (
    <div className="ww-root"><GlobalStyle /><div className="aurora" /><div className="aurora2" />{children}</div>
  );

  if (!state) return (
    <Shell><div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", position: "relative", zIndex: 1 }}><Wolli size={120} wave /></div></Shell>
  );

  if (!state.onboarded) return (
    <Shell><Onboarding onDone={(d) => update({ ...d, onboarded: true })} /></Shell>
  );

  if (view === "lessonIntro") return (
    <Shell><LessonIntro lesson={activeLesson} onExit={() => setView("main")} onStart={() => { setExercises(buildExercises(activeLesson)); setView("lesson"); }} /></Shell>
  );

  if (view === "lesson" || view === "review") return (
    <Shell><ExercisePlayer exercises={exercises} onExit={() => setView("main")} onFinish={(r) => {
      setResults(r);
      if (view === "lesson") setDoneTitle(activeLesson.title);
      setState((s) => { const n = { ...s, ...applyResults(s, r) }; saveState(n); return n; });
      setView("done");
    }} /></Shell>
  );

  if (view === "done") return (
    <div className="ww-root"><GlobalStyle />
      <LessonComplete results={results} title={doneTitle} onClose={(xp) => {
        setState((s) => {
          const completed = activeLesson && doneTitle === activeLesson.title && !s.completed.includes(activeLesson.id) ? [...s.completed, activeLesson.id] : s.completed;
          const n = { ...s, ...addXpPatch(s, xp), completed };
          saveState(n); return n;
        });
        setView("main"); setTab("home"); setActiveLesson(null);
      }} />
    </div>
  );

  if (view === "exam") return (
    <Shell><ExercisePlayer exercises={exercises} onExit={() => setView("main")} onFinish={(r) => {
      setResults(r);
      const score = r.filter((x) => x.ok).length;
      setState((s) => {
        const n = { ...s, ...applyResults(s, r), ...addXpPatch(s, score * 2), examHistory: [...s.examHistory, { date: todayStr(), score, total: r.length, mode: examMode }] };
        saveState(n); return n;
      });
      setView("examDone");
    }} /></Shell>
  );

  if (view === "examDone") return (
    <Shell><ExamResult results={results} mode={examMode} onClose={() => setView("main")} onRetry={() => { setExercises(examMode === "goethe" ? buildGoethe() : buildExam()); setView("exam"); }} /></Shell>
  );

  return (
    <Shell>
      <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", position: "relative" }}>
        <TopBar state={state} />
        {tab === "home" && <HomePath state={state} onStartReview={() => startReview()} onStartLesson={(l) => { setActiveLesson(l); setView("lessonIntro"); }} />}
        {tab === "vocab" && <VocabCards state={state} onStartReview={() => startReview()} />}
        {tab === "chat" && <AIChat />}
        {tab === "exam" && <ExamHome state={state} onStart={(m) => { setExamMode(m); setExercises(m === "goethe" ? buildGoethe() : buildExam()); setView("exam"); }} />}
        {tab === "profile" && <Profile state={state} onStudyMistakes={startMistakes} />}

        <div className="glass" style={{ position: "fixed", bottom: "calc(14px + env(safe-area-inset-bottom))", left: "50%", transform: "translateX(-50%)", width: "calc(100% - 28px)", maxWidth: 402, display: "flex", padding: 8, borderRadius: 32, zIndex: 50 }}>
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button key={t.id} className="ww-btn" onClick={() => setTab(t.id)} style={{
                flex: 1, background: active ? GRAD : "transparent", borderRadius: 24,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "9px 2px",
                boxShadow: active ? "inset 0 1.5px 1px rgba(255,255,255,.5), inset 0 -2px 3px rgba(0,0,0,.15), 0 12px 24px -6px rgba(91,69,246,.55)" : "none", transition: "all .25s",
              }}>
                <t.Ic size={21} color={active ? "#fff" : "#A8A3C7"} strokeWidth={active ? 2.4 : 2} />
                <span className="baloo" style={{ fontSize: 10, fontWeight: 800, color: active ? "#fff" : "#A8A3C7" }}>{t.t}</span>
              </button>
            );
          })}
        </div>
      </div>
    </Shell>
  );
}
