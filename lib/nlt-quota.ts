// Best-effort per-instance timestamps only. Serverless instances do not share memory.
// Never pass request, visitor, reference or key data. Restarting resets protection.
export interface NltQuota {
  reserve(limit: number): Promise<void>;
  block(milliseconds: number): Promise<void>;
}

const DAY = 86_400_000;
export function createLocalQuota(now: () => number = Date.now): NltQuota {
  let times: number[] = [];
  let blockedUntil = 0;
  return {
    async reserve(limit) {
      const time = now();
      times = times.filter(value => value > time - DAY);
      if (time < blockedUntil || times.length >= limit || times.filter(value => value > time - 60_000).length >= 20) {
        throw new Error("NLT quota unavailable.");
      }
      times.push(time);
    },
    async block(milliseconds) { blockedUntil = Math.max(blockedUntil, now() + milliseconds); },
  };
}

export const instanceQuota = createLocalQuota();

export function retryAfterMilliseconds(value: string | null, now = Date.now()): number {
  const duration = value && /^\d+$/.test(value) ? Number(value) * 1000 : Date.parse(value ?? "") - now;
  return Number.isSafeInteger(duration) ? Math.max(60_000, duration) : 60_000;
}
