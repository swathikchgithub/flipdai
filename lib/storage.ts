import { FlashCard, StudySession, SessionHistory } from "./flashcard-types";

const SESSIONS_KEY = "flashai_sessions";
const HISTORY_KEY = "flashai_history";
const STREAK_KEY = "flashai_streak";

export function saveSession(session: StudySession): void {
  if (typeof window === "undefined") return;
  const sessions = getSessions();
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) {
    sessions[idx] = session;
  } else {
    sessions.push(session);
  }
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function getSessions(): StudySession[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(SESSIONS_KEY) || "[]");
  } catch {
    return [];
  }
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
  const trimmed = history.slice(0, 100);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
}

export function getHistory(): SessionHistory[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

export function updateStreak(): number {
  if (typeof window === "undefined") return 0;
  try {
    const data = JSON.parse(localStorage.getItem(STREAK_KEY) || '{"streak":0,"lastDate":""}');
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (data.lastDate === today) {
      return data.streak;
    } else if (data.lastDate === yesterday) {
      data.streak += 1;
    } else {
      data.streak = 1;
    }
    data.lastDate = today;
    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
    return data.streak;
  } catch {
    return 0;
  }
}

export function getStreak(): number {
  if (typeof window === "undefined") return 0;
  try {
    const data = JSON.parse(localStorage.getItem(STREAK_KEY) || '{"streak":0,"lastDate":""}');
    return data.streak;
  } catch {
    return 0;
  }
}
