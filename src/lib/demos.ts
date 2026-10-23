/* ——— Three curated demo transcripts — analyzed through the real engine ——— */

import { Analysis, buildAnalysis, syntheticRaw } from "./audio";

export interface DemoDef { id: string; title: string; tagline: string; duration: number; transcript: string; seed: number; tag: string }

export const DEMO_DEFS: DemoDef[] = [
  {
    id: "product-keynote",
    title: "Product Keynote — Aurora 2.0",
    tagline: "A founder launches a voice-intelligence platform on stage",
    duration: 92,
    seed: 11,
    tag: "Keynote",
    transcript:
      "Good evening everyone. Tonight we are not just shipping a product, we are shipping a promise. Absolutely everything about Aurora 2.0 was rebuilt from the ground up by the most talented team we have ever assembled. Imagine an inbox that understands tone, urgency, and context before you even open it. That is the breakthrough we are announcing tonight. When we started this journey three years ago, people told us voice intelligence was a solved problem. It was not. Far from it. We spent eighteen months gathering four hundred hours of real conversations, real meetings, real moments of hesitation and excitement. What we found genuinely surprised us. People do not just want to be understood, they want to be witnessed. Now look at this number. Ninety four percent of decisions in this company are still made from reading text alone. Think about what that means. Entirely without tone, without pacing, without the human signal that lives between the words. Aurora 2.0 changes the equation completely. Every call, every interview, every keynote like this one now becomes searchable, measurable, and deeply human. I absolutely love what this team has built. The clarity you will feel in the first five minutes is undeniable. So here is my ask tonight. Take it for a spin next month. Bring it to your hardest conversation. And watch what happens when insight finally has a voice. Thank you.",
  },
  {
    id: "investor-earnings",
    title: "Investor Earnings Call — Q3 Review",
    tagline: "A CFO walks analysts through results and headwinds",
    duration: 112,
    seed: 29,
    tag: "Earnings",
    transcript:
      "Good morning and thank you all for joining the third quarter review. Let me be direct about the quarter we just delivered. Revenue grew eleven percent year over year to four hundred and twelve million dollars. That is below our internal target and frankly it is not where we want to be. Gross margin improved one hundred and forty basis points to sixty eight point two percent, and that strength gives us real room to invest. Operating discipline held firm with adjusted EBITDA of ninety six million. Now, the harder conversation. Enterprise renewals slipped in August. We believe this reflects broader macro uncertainty rather than competitive loss, and I want to walk through the evidence carefully. Pipeline coverage entering the fourth quarter stands at three point two times, which is healthy. Honestly, I am concerned about elongation in sales cycles, and we are being appropriately cautious with next year's guidance. We are reducing discretionary spend by eight percent and redeploying into reliability and support. Turnaround initiatives in EMEA are tracking ahead of schedule, with two of three pilot teams already back to plan. Look, we have navigated tougher quarters than this. The fundamentals of the business remain intact. We will not chase growth at the expense of durability. On behalf of the executive team, thank you for your continued trust in this company. We will take your questions now.",
  },
  {
    id: "podcast-interview",
    title: "Podcast Interview — The Craft of Attention",
    tagline: "A deep-dive conversation on focus, creativity and burnout",
    duration: 110,
    seed: 47,
    tag: "Podcast",
    transcript:
      "Welcome back to the show. Today I am sitting down with Dr. Maya Chen, who spent a decade studying attention in high performance teams. Maya, it is so wonderful to finally have you here. Thank you for having me, it is genuinely a delight to be here. So let us start with the big question. Why does attention feel so broken right now? I think we have confused stimulation with significance. Honestly, we have built environments that reward the loudest signal rather than the most meaningful one. That exhausts people. Constantly switching costs us far more energy than we realize. What does that cost look like in practice? It looks like exhaustion that sleep does not fix. It looks like reading the same paragraph four times. It looks like that quiet dread on Sunday evening. I have certainly been there. What I find fascinating is the recovery curve. When people protect even ninety minutes of true undistracted work, cognitive endurance comes back astonishingly fast. So what is your single most practical recommendation? Start smaller than feels ambitious. Twenty minutes, phone in another room, one meaningful task. Track how you feel. Most people discover the anxiety was the avoidance, not the work. And for anyone feeling completely overwhelmed right now, what would you say? I would say you are not weak, you are overstimulated. Be gentle with yourself. Attention is a muscle and it is waiting for you to come back to it. This has been remarkable, Maya. Thank you. Thank you, this was a joy.",
  },
];

const cache = new Map<string, Analysis>();

export function getDemoAnalysis(id: string): Analysis {
  if (cache.has(id)) return cache.get(id)!;
  const def = DEMO_DEFS.find(d => d.id === id);
  if (!def) throw new Error("Unknown demo");
  const raw = syntheticRaw(def.duration, def.seed);
  const analysis = buildAnalysis(def.title, "demo", raw, def.transcript);
  cache.set(id, analysis);
  return analysis;
}

export function heroShowcase(): Analysis {
  // Keynote powers the hero waveform preview
  return getDemoAnalysis("product-keynote");
}
