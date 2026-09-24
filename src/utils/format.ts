/** mm:ss из миллисекунд, округление вверх — чтобы «0:01» не превращалось в «0:00» раньше времени. */
export function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/** Склонение: pluralize(3, ["игрок", "игрока", "игроков"]) → «игрока». */
export function pluralize(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (last > 1 && last < 5) return forms[1];
  if (last === 1) return forms[0];
  return forms[2];
}

export function formatMinutes(minutes: number): string {
  return `${minutes} ${pluralize(minutes, ["минута", "минуты", "минут"])}`;
}
