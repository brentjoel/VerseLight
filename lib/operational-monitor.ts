// Server-only call sites. Fixed aggregate codes, never arbitrary error payloads.
export type OperationalCode = "nlt_fallback" | "server_error";
export function createOperationalMonitor(write: (code: OperationalCode) => void, now: () => number = () => performance.now()) {
  const last: Partial<Record<OperationalCode, number>> = {};
  return (code: OperationalCode) => {
    if (code !== "nlt_fallback" && code !== "server_error") return;
    const time = now();
    if (last[code] !== undefined && time - last[code] < 60_000) return;
    last[code] = time;
    write(code);
  };
}
export const reportOperationalEvent = createOperationalMonitor(code => console.warn(`[verselight] ${code}`));
