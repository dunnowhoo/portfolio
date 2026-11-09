// Tanggal & jam menurut zona waktu profil (default Asia/Jakarta; nanti Asia/Tokyo)
export function localDate(d: Date, tz: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d); // YYYY-MM-DD
}

export function daysUntil(target: Date, tz: string, now = new Date()): number {
  return Math.round((Date.parse(localDate(target, tz)) - Date.parse(localDate(now, tz))) / 86_400_000);
}

export function localHour(d: Date, tz: string): number {
  return Number(new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', hourCycle: 'h23' }).format(d));
}

export function greeting(hour: number): { jp: string; romaji: string } {
  if (hour >= 4 && hour < 11) return { jp: 'おはよう', romaji: 'Ohayō' };
  if (hour >= 11 && hour < 18) return { jp: 'こんにちは', romaji: 'Konnichiwa' };
  return { jp: 'こんばんは', romaji: 'Konbanwa' };
}

export function longDateId(d: Date, tz: string): string {
  return new Intl.DateTimeFormat('id-ID', { timeZone: tz, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}

export function shortDateId(d: Date, tz: string): string {
  return new Intl.DateTimeFormat('id-ID', { timeZone: tz, day: 'numeric', month: 'short', year: 'numeric' }).format(d);
}
