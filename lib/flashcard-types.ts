export interface FlashCard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  difficulty: 1 | 2 | 3;
  category: string;
  subcategory: string;
}

export interface StudySession {
  id: string;
  topic: string;
  subcategory: string;
  cards: FlashCard[];
  known: string[];
  review: string[];
  skipped: string[];
  startTime: string;
  endTime?: string;
}

export interface SessionHistory {
  id: string;
  topic: string;
  subcategory: string;
  cardCount: number;
  knownCount: number;
  reviewCount: number;
  date: string;
  score: number;
}

export type StudyMode = "flash" | "quiz" | "type" | "voice";
export type CardStatus = "known" | "review" | "skipped" | "unseen";
