import type { Scenario } from "@/types";

/** Ssenariydagi eng yuqori mumkin bo'lgan ball (graf bo'ylab DFS). */
export function getMaxScore(scenario: Scenario): number {
  const memo = new Map<string, number>();
  const visit = (stepId: string, seen: Set<string>): number => {
    if (memo.has(stepId)) return memo.get(stepId)!;
    const step = scenario.steps[stepId];
    if (!step || seen.has(stepId)) return 0;
    seen.add(stepId);
    const best = Math.max(
      ...step.choices.map((c) => c.outcome.points + (c.outcome.nextStepId ? visit(c.outcome.nextStepId, seen) : 0)),
    );
    seen.delete(stepId);
    memo.set(stepId, best);
    return best;
  };
  return visit(scenario.startStepId, new Set());
}

/** Ssenariy grafini tekshiradi: yo'q qadamlarga havolalar va yakunsiz tanlovlar. */
export function validateScenario(scenario: Scenario): string[] {
  const errors: string[] = [];
  if (!scenario.steps[scenario.startStepId]) errors.push(`Boshlang‘ich qadam topilmadi: ${scenario.startStepId}`);
  for (const step of Object.values(scenario.steps)) {
    if (step.choices.length === 0) errors.push(`«${step.id}» qadamida tanlov yo‘q`);
    for (const c of step.choices) {
      const { nextStepId, endingId } = c.outcome;
      if (nextStepId && !scenario.steps[nextStepId]) errors.push(`«${c.id}» noma’lum qadamga ishora qiladi: ${nextStepId}`);
      if (!nextStepId && !endingId) errors.push(`«${c.id}» tanlovida na keyingi qadam, na yakun bor`);
    }
  }
  return errors;
}

export function countSteps(scenario: Scenario) {
  return Object.keys(scenario.steps).length;
}

export function countEndings(scenario: Scenario) {
  const set = new Set<string>();
  for (const step of Object.values(scenario.steps))
    for (const c of step.choices) if (c.outcome.endingId) set.add(c.outcome.endingId);
  return set.size;
}
