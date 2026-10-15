export interface WaveCharacter { speed: number; amplitude: number; smoothness: number; color: string }

// Visual characters only. Labels, order and routes always come from emotions.json.
export const waveCharacters: Readonly<Record<string, WaveCharacter>> = {
  anxious: { speed: 1.1, amplitude: .24, smoothness: 7, color: "#88a8a1" },
  sad: { speed: .35, amplitude: .16, smoothness: 2, color: "#8aa0be" },
  angry: { speed: .9, amplitude: .3, smoothness: 9, color: "#be9087" },
  tired: { speed: .25, amplitude: .1, smoothness: 3, color: "#a596bb" },
  guilty: { speed: .5, amplitude: .18, smoothness: 5, color: "#89acb3" },
  grateful: { speed: .65, amplitude: .23, smoothness: 4, color: "#acb38f" },
  hopeful: { speed: .55, amplitude: .27, smoothness: 3, color: "#c4b389" },
  doubtful: { speed: .4, amplitude: .14, smoothness: 6, color: "#b393aa" },
};
export const defaultCharacter = waveCharacters.hopeful;
export function wrapIndex(index: number, count: number): number {
  return count > 0 ? ((Math.round(index) % count) + count) % count : 0;
}
export function waveHeight(angle: number, time: number, character: WaveCharacter): number {
  return .08 + character.amplitude * (.5 + .5 * Math.sin(angle * character.smoothness + time * character.speed));
}
export function needsSimplePicker(reducedMotion: boolean, cores?: number): boolean {
  return reducedMotion || (cores !== undefined && cores > 0 && cores <= 2);
}
export function isSlowWheel(frameCount: number, elapsed: number): boolean {
  return elapsed >= 2000 && frameCount / (elapsed / 1000) < 24;
}
