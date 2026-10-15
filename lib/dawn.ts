// Preserve every source character, including newlines and nonbreaking spaces.
export function passageTokens(text: string): string[] {
  return text.split(/(\s+)/u).filter(Boolean);
}

export function wordDelay(index: number): number {
  return 600 + Math.max(0, index) * 260;
}

// One disposable run per visible verse. A skipped/cancelled run cannot accept
// late effects; the next verse always gets a fresh run with the full cadence.
export function createDawnRun() {
  let running = true;
  const effects = new Set<{ cancel(): void }>();
  return {
    get running() { return running; },
    add(effect: { cancel(): void }) {
      if (running) effects.add(effect);
      else effect.cancel();
    },
    cancel() {
      running = false;
      effects.forEach(effect => effect.cancel());
      effects.clear();
    },
  };
}

// One navigation intent in memory only. No verse text, persistence or URL fields.
let pendingPath: string | undefined;
export function prepareDawn(path: string): void { pendingPath = path; }
export function consumeDawn(path: string): boolean {
  const matches = pendingPath === path;
  pendingPath = undefined;
  return matches;
}
