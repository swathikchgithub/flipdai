import { FlashCard, StudySession, SessionHistory } from "./flashcard-types";

const SESSIONS_KEY = "flipdai_sessions";
const HISTORY_KEY  = "flipdai_history";
const STREAK_KEY   = "flipdai_streak";

export function saveSession(session: StudySession): void {
  if (typeof window === "undefined") return;
  const sessions = getSessions();
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) sessions[idx] = session;
  else sessions.push(session);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function getSessions(): StudySession[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(SESSIONS_KEY) || "[]"); }
  catch { return []; }
}

export function getSession(id: string): StudySession | null {
  return getSessions().find((s) => s.id === id) || null;
}

export function deleteSession(id: string): void {
  if (typeof window === "undefined") return;
  const sessions = getSessions().filter((s) => s.id !== id);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function saveHistory(entry: SessionHistory): void {
  if (typeof window === "undefined") return;
  const history = getHistory();
  history.unshift(entry);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 100)));
}

export function getHistory(): SessionHistory[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); }
  catch { return []; }
}

export function updateStreak(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    // Support both old format (number string) and new format (object)
    let streak = 0;
    let lastDate = "";
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "number") { streak = parsed; }
      else { streak = parsed.streak || 0; lastDate = parsed.lastDate || ""; }
    }
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (lastDate === today) return streak;
    if (lastDate === yesterday) streak += 1;
    else streak = 1;
    localStorage.setItem(STREAK_KEY, JSON.stringify({ streak, lastDate: today }));
    return streak;
  } catch { return 0; }
}

export function getStreak(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    if (typeof parsed === "number") return parsed;
    return parsed.streak || 0;
  } catch { return 0; }
}
