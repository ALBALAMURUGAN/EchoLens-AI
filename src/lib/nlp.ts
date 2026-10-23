/* ————————————————————————————————————————————————————————
   EchoLens NLP Core — lexicon-based sentiment, emotion-cue
   mapping, keyword extraction, readability. Pure functions.
   ———————————————————————————————————————————————————————— */

export const STOPWORDS = new Set((`a,about,above,after,again,against,all,am,an,and,any,are,aren't,as,at,be,because,been,before,being,below,between,both,but,by,can,cannot,could,couldn't,did,didn't,do,does,doesn't,doing,don't,down,during,each,few,for,from,further,had,hadn't,has,hasn't,have,haven't,having,he,he'd,he'll,he's,her,here,here's,hers,herself,him,himself,his,how,how's,i,i'd,i'll,i'm,i've,if,in,into,is,isn't,it,it's,its,itself,let's,me,more,most,mustn't,my,myself,nor,of,off,on,once,only,or,other,ought,our,ours,ourselves,out,over,own,same,shan't,she,she'd,she'll,she's,should,shouldn't,so,some,such,than,that,that's,the,their,theirs,them,themselves,then,there,there's,these,they,they'd,they'll,they're,they've,this,those,through,to,too,under,until,up,very,was,wasn't,we,we'd,we'll,we're,we've,were,weren't,what,what's,when,when's,where,where's,which,while,who,who's,whom,why,why's,with,won't,would,wouldn't,you,you'd,you'll,you're,you've,your,yours,yourself,yourselves,also,just,like,know,really,got,get,going,went,come,want,thing,things,one,much,many,well,back,even,still,way,lot,maybe`).split(","));

/* Positive / negative sentiment lexicon (weighted) */
const POS: Record<string, number> = {
  amazing:3, incredible:3, extraordinary:3, exceptional:3, fantastic:3, phenomenal:3, brilliant:3, outstanding:3, magnificent:3,
  excellent:2.6, wonderful:2.6, tremendous:2.5, masterpiece:2.6, triumphant:2.6, flawless:2.6, genius:2.4, superb:2.5, gold:2.2,
  love:2.4, loved:2.3, loving:2.2, passion:2.2, passionate:2.2, thrilled:2.5, thrilling:2.4, delighted:2.4, excited:2.3, exciting:2.2,
  great:2.2, awesome:2.3, perfect:2.4, beautiful:2.1, gorgeous:2.1, stunning:2.2, breathtaking:2.4, elegant:2, premium:1.9,
  good:1.6, nice:1.4, glad:1.8, happy:2, joy:2.3, joyful:2.4, hopeful:1.9, hope:1.7, optimistic:2, promising:1.8, progress:1.7,
  success:2.2, successful:2.2, achieved:2, achieve:1.9, winning:2, win:1.8, won:1.8, victory:2.2, grow:1.6, growth:1.7, growing:1.5,
  strong:1.6, stronger:1.7, strength:1.7, improve:1.6, improved:1.6, improvement:1.6, better:1.5, best:2.2, favorite:1.9,
  confident:1.9, confidence:1.9, clear:1.4, clarity:1.6, simple:1.3, easy:1.4, easier:1.4, smooth:1.5, seamless:1.8, elegant2:0,
  appreciate:1.8, grateful:2.1, thank:1.6, thanks:1.6, helpful:1.7, help:1.3, useful:1.5, benefit:1.6, valuable:1.7, value:1.4,
  insight:1.6, insights:1.6, learn:1.4, discovery:1.7, discover:1.6, opportunity:1.7, opportunities:1.7, potential:1.5, future:1.3,
  innovative:1.8, innovation:1.8, breakthrough:2.4, transform:1.8, transformed:1.8, transformation:1.8, revolution:1.9, pioneer:1.9,
  resonate:1.8, resonates:1.8, engaging:1.7, engaged:1.5, captivate:2, captivating:2.1, inspiring:2.1, inspire:2, inspired:2,
  curious:1.3, wonder:1.3, fascinated:2, fascinate:2, interesting:1.4, meaningful:1.8, purpose:1.6, proud:2.1, proudly:2,
  effective:1.6, efficient:1.5, productive:1.6, accurate:1.6, reliable:1.6, trust:1.8, trusted:1.8, reliable2:0, win2:0,
  achieve2:0, solution:1.2, solved:1.5, solve:1.4, resolve:1.2, resolution:1.2, energy:1.2, energize:1.6, energetic:1.7, dynamic:1.4,
  delight:2.2, delightful:2.3, charm:1.6, charming:1.7, warm:1.3, warmer:1.3, heart:1.3, hero:1.8, powerful:1.7, empower:1.8,
  free:1.2, freedom:1.7, open:1, friendly:1.5, welcoming:1.5, generous:1.6, kind:1.5, gentle:1.2, safe:1.4, secure:1.5, stable:1.3,
  momentum:1.7, accelerating:1.6, soar:1.9, soaring:1.9, thrive:1.9, thriving:1.9, flourish:1.9, breakthrough2:0, affirm:1.6, yes:1,
};

const NEG: Record<string, number> = {
  terrible:3, horrible:3, atrocious:3, abysmal:3, dreadful:2.8, nightmare:2.6, disaster:2.7, catastrophe:2.7, worst:2.8,
  awful:2.4, bad:1.8, worse:2, poor:1.7, disappointing:2.2, disappoint:2, disappointed:2.1, frustrating:2.3, frustrated:2.1, frustration:2.2,
  angry:2.4, anger:2.3, furious:2.7, rage:2.5, annoyed:1.9, annoying:1.9, irritated:1.9, bother:1.3, bothering:1.4, upset:2,
  hate:2.4, hated:2.3, despise:2.5, resent:2, resentment:2.2, sick:1.6, tired:1.4, exhausted:2.1, drained:1.9, burnout:2.4,
  sad:2, sadness:2.2, depressing:2.4, depressed:2.3, despair:2.6, hopeless:2.6, bleak:2, grim:1.9, dark:1,
  fear:2.2, afraid:2.1, scared:2, terrified:2.5, anxious:2.1, anxiety:2.2, nervous:1.8, worried:1.9, worry:1.8, stress:2, stressed:2.1,
  stressful:2, overwhelmed:2.1, overwhelming:1.9, panic:2.4, panic2:0, uneasy:1.6, uncertain:1.2, uncertainty:1.5, doubt:1.5, doubtful:1.6,
  confused:1.6, confusing:1.7, confusing2:0, unclear:1.3, lost:1.3, stuck:1.5, blocking:1.3, blocked:1.4, problem:1.4, problems:1.4,
  issue:1, issues:1.1, difficulty:1.4, difficult:1.3, hard:1, tough:1.1, struggle:1.8, struggling:1.9, struggles:1.8, fail:2, failed:2.1, failure:2.3,
  failing:2, breakdown:2, breaking:1.3, broken:1.9, error:1.2, errors:1.3, bug:1.3, wrong:1.6, mistake:1.6, mistakes:1.6,
  crisis:2.4, critical:1.2, urgent:1.1, severe:1.7, serious:1, dangerous:1.9, risk:1.3, risky:1.5, threat:1.9,
  complaint:1.6, complain:1.6, complained:1.6, unhappy:2, dissatisfied:2.1, regret:1.9, regretted:1.9, sorry:1, apolog:1, concern:1.2, concerned:1.2,
  boring:1.8, dull:1.7, tedious:1.8, monotonous:1.8, flat:1, waste:1.8, wasted:1.8, pointless:2, never:1.3, nothing:1.1, nobody:1.2,
  "impossible":1.8, "can't":1.4, cannot:1.2, "don't":0.7, "won't":0.9, "isn't":0.8, "aren't":0.7, meh:1.6, ugh:1.8, hmm:0.3,
  lose:1.6, losing:1.6, lost2:0, decline:1.5, declining:1.5, drop:1.3, dropped:1.3, falling:1.4, fell:1.2, below:0.8, down:0.8, low:0.6,
  alone:1.6, lonely:2.2, isolated:1.7, excluded:1.8, ignored:1.7, invisible:1.5, miss:1.1, missing:1, lack:1.2, lacking:1.3,
  blame:1.6, fault:1.4, guilty:1.7, shame:2.1, embarrassed:1.8, awkward:1.3, uncomfortable:1.5,
};

const EMOTION_CUES: Record<string, string[]> = {
  confident: ["absolutely","definitely","certainly","undoubtedly","clearly","confident","strong","proven","measured","delivered","commanding","decisive"],
  joyful: ["love","amazing","excited","wonderful","delighted","thrilled","fantastic","awesome","happy","joy","celebrate","beautiful"],
  calm: ["steady","calm","peace","gentle","slowly","breathe","balance","settle","quiet","measured","centered","grounded"],
  engaged: ["curious","interesting","fascinating","imagine","consider","notice","explore","discover","listen","look","question","wonder"],
  reflective: ["think","thought","consider","perhaps","maybe","wonder","remember","reflect","meaning","why","sense","understand"],
  anxious: ["worry","worried","nervous","anxious","uncertain","unsure","afraid","tension","stress","hurried","rush","overwhelmed"],
  frustrated: ["frustrated","frustrating","annoying","wrong","broken","fail","terrible","awful","stuck","impossible","waste","angry","complaint"],
  low: ["tired","sad","drained","exhausted","quiet","heavy","low","weary","flat","numb","alone","empty"],
};

export interface TextStats {
  words: number; sentences: number; syllables: number;
  sentiment: number;          // -1 .. 1
  emotionCue: Record<string, number>; // raw cue hits per emotion
  avgWordLen: number;
}

const tokenize = (text: string): string[] =>
  (text.toLowerCase().match(/[a-z][a-z'-]*/g) || []);

export function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length <= 3) return 1;
  const groups = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}

export function analyzeText(text: string): TextStats {
  const tokens = tokenize(text);
  const words = tokens.length;
  const sentences = Math.max(1, (text.match(/[.!?…]+(\s|$)/g) || []).length);
  let pos = 0, neg = 0, syllables = 0;
  const cue: Record<string, number> = {};
  for (const emo of Object.keys(EMOTION_CUES)) cue[emo] = 0;

  for (const t of tokens) {
    syllables += countSyllables(t);
    if (POS[t]) pos += POS[t];
    if (NEG[t]) neg += NEG[t];
    for (const emo of Object.keys(EMOTION_CUES)) {
      if (EMOTION_CUES[emo].includes(t)) cue[emo] += 1;
    }
  }
  // intensifier & negator handling (light window pass)
  const raw = tokens;
  for (let i = 0; i < raw.length; i++) {
    const t = raw[i];
    if (t === "very" || t === "really" || t === "extremely" || t === "so" || t === "deeply") {
      // amplify next sentiment word
      for (let j = i + 1; j < Math.min(i + 3, raw.length); j++) {
        if (POS[raw[j]]) pos += POS[raw[j]] * 0.6;
        else if (NEG[raw[j]]) neg += NEG[raw[j]] * 0.6;
      }
    }
    if (t === "not" || t === "never" || t === "no" || t === "hardly") {
      for (let j = i + 1; j < Math.min(i + 3, raw.length); j++) {
        if (POS[raw[j]]) neg += POS[raw[j]] * 1.1;
        else if (NEG[raw[j]]) pos += NEG[raw[j]] * 0.9;
      }
    }
  }
  const total = pos + neg;
  const sentiment = total === 0 ? 0 : Math.max(-1, Math.min(1, (pos - neg) / (total + 4.5)));
  const avgWordLen = words ? tokens.reduce((a, t) => a + t.length, 0) / words : 0;
  return { words, sentences, syllables, sentiment, emotionCue: cue, avgWordLen };
}

/* Flesch Reading Ease (0–100) */
export function readingEase(stats: TextStats): number {
  if (!stats.words) return 60;
  const score = 206.835 - 1.015 * (stats.words / stats.sentences) - 84.6 * (stats.syllables / stats.words);
  return Math.round(Math.max(0, Math.min(100, score)));
}

export function topKeywords(text: string, limit = 12): { word: string; count: number }[] {
  const tokens = tokenize(text).filter(t => t.length > 3 && !STOPWORDS.has(t));
  const freq = new Map<string, number>();
  for (const t of tokens) freq.set(t, (freq.get(t) || 0) + 1);
  return [...freq.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
    .slice(0, limit);
}

const FILLER_LIST = ["um","uh","like","actually","basically","literally","really","very","just","kind of","sort of","you know","i mean","so yeah"];
const FILLER_SINGLE = new Set(["um","uh","like","actually","basically","literally","really","very","just","yeah"]);

export function fillerStats(text: string): { total: number; per100: number; hits: { word: string; count: number }[] } {
  const lower = " " + text.toLowerCase() + " ";
  const words = tokenize(text).length;
  const hits: { word: string; count: number }[] = [];
  let total = 0;
  for (const f of FILLER_SINGLE) {
    const re = new RegExp(`\\b${f}\\b`, "g");
    const n = (lower.match(re) || []).length;
    if (n > 0) { hits.push({ word: f, count: n }); total += n; }
  }
  for (const f of ["kind of","sort of","you know","i mean"]) {
    const re = new RegExp(`\\b${f}\\b`, "g");
    const n = (lower.match(re) || []).length;
    if (n > 0) { hits.push({ word: f, count: n }); total += n; }
  }
  hits.sort((a, b) => b.count - a.count);
  return { total, per100: words ? +((total / words) * 100).toFixed(2) : 0, hits };
}

export function sentimentLabel(s: number): string {
  if (s >= 0.5) return "Strongly Positive";
  if (s >= 0.18) return "Positive";
  if (s >= 0.05) return "Mildly Positive";
  if (s > -0.05) return "Neutral";
  if (s > -0.18) return "Mildly Negative";
  if (s > -0.5) return "Negative";
  return "Strongly Negative";
}

export function splitSentences(text: string): string[] {
  const out = text.match(/[^.!?…]+[.!?…]+["')\]]*|[^.!?…]+$/g);
  return (out || [text]).map(s => s.trim()).filter(s => s.length > 1);
}
