import { PROBLEMS } from "@/data/problems/registry";

export const DISCORD_INVITE_URL = "https://discord.gg/quantacademy";
export const DISCORD_LABEL = "Join the Quant Academy Discord";

function isoWeekId(d = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - day + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const fDay = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - fDay + 3);
  const week = 1 + Math.round((date.getTime() - firstThursday.getTime()) / (7 * 86400000));
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function seededPick<T>(arr: T[], seed: number, n: number): T[] {
  let s = seed;
  const rand = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
  const copy = [...arr];
  const out: T[] = [];
  while (copy.length > 0 && out.length < n) {
    out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0]!);
  }
  return out;
}

export function currentWeekId(d = new Date()): string {
  return isoWeekId(d);
}

export function weeklyChallenge(weekId?: string) {
  const id = weekId ?? isoWeekId();
  let seed = 0;
  for (const c of id) seed = (seed * 31 + c.charCodeAt(0)) % 4294967296;
  const problems = seededPick(PROBLEMS, seed, 3);
  return {
    weekId: id,
    title: `Weekly Challenge · ${id}`,
    problems,
    backtestPrompt:
      "Build an RSI mean-reversion strategy on NIFTY 50 and beat buy & hold. Share your card in Discord.",
  };
}

export function msUntilNextMondayIST(now = new Date()): number {
  const istOffsetMin = 330;
  const utcMin = now.getTime() / 60000 + now.getTimezoneOffset();
  const ist = new Date((utcMin + istOffsetMin) * 60000);
  const daysUntilMonday = ((8 - ist.getDay()) % 7) || 7;
  const next = new Date(ist);
  next.setDate(ist.getDate() + daysUntilMonday);
  next.setHours(0, 0, 0, 0);
  return Math.max(0, next.getTime() - ist.getTime());
}
