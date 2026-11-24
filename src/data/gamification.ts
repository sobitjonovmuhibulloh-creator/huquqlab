import type { BadgeDef, WeeklyChallenge } from "@/types";

export const XP_RULES = {
  topicComplete: 50,
  quizPerCorrect: 10,
  /** Simulyator balli shu koeffitsiyentga ko'paytiriladi (faqat ijobiy, eng yaxshi natija o'sishi) */
  simulatorMultiplier: 2,
  simulatorFirstPlay: 20,
} as const;

export const badges: BadgeDef[] = [
  { id: "birinchi-qadam", name: "Birinchi qadam", description: "Birinchi mavzuni o‘rganib chiqding", emoji: "🌱" },
  { id: "bilimdon", name: "Bilimdon", description: "5 ta mavzuni o‘rganding", emoji: "📚" },
  { id: "mukammal-natija", name: "Mukammal natija", description: "Testdan 100% natija oldingiz", emoji: "🎯" },
  { id: "test-ustasi", name: "Test ustasi", description: "5 ta testdan 80% va undan yuqori natija", emoji: "🧠" },
  { id: "halol-qahramon", name: "Halol qahramon", description: "«Topilgan hamyon» simulyatorini eng yaxshi yakun bilan tugatding", emoji: "👛" },
  { id: "raqamli-himoyachi", name: "Raqamli himoyachi", description: "Kiberbullingga qarshi to‘g‘ri yo‘lni tanlading", emoji: "🛡️" },
  { id: "ongli-istemolchi", name: "Ongli iste’molchi", description: "Iste’molchi huquqlaringni qonuniy himoya qilding", emoji: "🧾" },
  { id: "simulyator-ustasi", name: "Simulyator ustasi", description: "Barcha simulyatorlarni o‘ynab chiqding", emoji: "🕹️" },
  { id: "haftalik-chempion", name: "Haftalik chempion", description: "Haftalik challenge'ni bajarding", emoji: "🏆" },
  { id: "izchil-oquvchi", name: "Izchil o‘quvchi", description: "3 kun ketma-ket o‘qiding", emoji: "🔥" },
  { id: "huquq-ustasi", name: "Huquq ustasi", description: "500 XP to‘plading", emoji: "⚖️" },
];

export const badgeById = Object.fromEntries(badges.map((b) => [b.id, b])) as Record<string, BadgeDef>;

export const weeklyChallenges: WeeklyChallenge[] = [
  { id: "wc-topics-3", title: "Bilim haftaligi", description: "Shu hafta 3 ta mavzuni o‘rganib chiq", type: "topic", target: 3, rewardXp: 100 },
  { id: "wc-sim-2", title: "Qaror qabul qiluvchi", description: "Shu hafta 2 ta simulyatorni yakunla", type: "simulator", target: 2, rewardXp: 100 },
  { id: "wc-quiz-3", title: "Test marafoni", description: "Shu hafta 3 ta testdan kamida 80% natija ol", type: "quiz", target: 3, minValue: 80, rewardXp: 120 },
];

export const LEVELS = [
  { min: 0, name: "Yangi o‘quvchi" },
  { min: 150, name: "Huquq izlovchi" },
  { min: 400, name: "Faol fuqaro" },
  { min: 800, name: "Huquq bilimdoni" },
  { min: 1300, name: "Yosh huquqshunos" },
  { min: 2000, name: "Huquq homiysi" },
];
