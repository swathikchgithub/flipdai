import { FlashCard } from "../../lib/flashcard-types";

export const MOCK_CARDS: FlashCard[] = [
  {
    id: "card-1",
    front: "What is a React Hook?",
    back: "A React Hook is a function that lets you use state and other React features in function components. Examples: useState, useEffect, useContext.",
    hint: "Think: functions starting with 'use'",
    difficulty: 1,
    category: "tech-topics",
    subcategory: "React",
  },
  {
    id: "card-2",
    front: "What is the Virtual DOM?",
    back: "The Virtual DOM is a lightweight in-memory representation of the real DOM. React uses it to batch and minimize actual DOM updates for better performance.",
    hint: "Compare to a blueprint vs the actual building",
    difficulty: 2,
    category: "tech-topics",
    subcategory: "React",
  },
  {
    id: "card-3",
    front: "What is useEffect used for?",
    back: "useEffect runs side effects after render: data fetching, subscriptions, DOM mutations. It accepts a function and optional dependency array.",
    hint: "Replaces componentDidMount, componentDidUpdate, componentWillUnmount",
    difficulty: 2,
    category: "tech-topics",
    subcategory: "React",
  },
  {
    id: "card-4",
    front: "What is prop drilling?",
    back: "Prop drilling is passing data through multiple intermediate components that don't need it, just to reach a deeply nested component. Solved by Context or state managers.",
    hint: "Imagine passing a parcel through 5 people who don't need it",
    difficulty: 3,
    category: "tech-topics",
    subcategory: "React",
  },
  {
    id: "card-5",
    front: "What is React.memo?",
    back: "React.memo is a higher-order component that memoizes a component, preventing re-renders if props haven't changed. Used for performance optimization.",
    hint: "Like shouldComponentUpdate for function components",
    difficulty: 1,
    category: "tech-topics",
    subcategory: "React",
  },
];

export const MOCK_CARDS_25: FlashCard[] = Array.from({ length: 25 }, (_, i) => ({
  id: `card-${i + 1}`,
  front: `React Question ${i + 1}`,
  back: `Answer to React Question ${i + 1}`,
  hint: `Hint for question ${i + 1}`,
  difficulty: ([1, 2, 3][i % 3]) as 1 | 2 | 3,
  category: "tech-topics",
  subcategory: "React",
}));

export const MOCK_EVALUATE_CORRECT = {
  correct: true,
  score: 92,
  feedback: "Excellent answer! You covered all the key points.",
  missing: null,
};

export const MOCK_EVALUATE_INCORRECT = {
  correct: false,
  score: 35,
  feedback: "Partially correct. You missed some important details.",
  missing: "Missing: dependency array behavior",
};
