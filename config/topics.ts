export interface TopicConfig {
  id: string;
  label: string;
  icon: string;
  subcategories: string[];
  promptTemplate: string;
}

export const TOPICS: TopicConfig[] = [
  {
    id: "job-interviews",
    label: "Job Interviews",
    icon: "💼",
    subcategories: ["Behavioral (STAR)", "System Design", "SQL", "Python", "Java", "Leadership"],
    promptTemplate: "Generate {count} flash cards for job interview preparation on: {subcategory}. For Behavioral questions use STAR format. Front: interview question, Back: answer framework with key points, Hint: STAR components or key concepts.",
  },
  {
    id: "sat-prep",
    label: "SAT Prep",
    icon: "📚",
    subcategories: ["Math", "Reading", "Writing & Grammar", "Essay Techniques"],
    promptTemplate: "Generate {count} SAT prep flash cards for: {subcategory}. Front: concept, formula name, or question type. Back: explanation with formula + example. Hint: common traps to avoid.",
  },
  {
    id: "ap-exams",
    label: "AP Exams",
    icon: "🎓",
    subcategories: ["AP CS", "AP Calculus", "AP Physics", "AP Chemistry", "AP Biology", "AP History"],
    promptTemplate: "Generate {count} AP exam flash cards for: {subcategory}. Front: concept or question. Back: detailed explanation with formulas or key points. Hint: memory trick or real-world example.",
  },
  {
    id: "certifications",
    label: "Certifications",
    icon: "🏥",
    subcategories: ["AWS Cloud", "PMP Project Mgmt", "CPA Accounting", "NCLEX Nursing"],
    promptTemplate: "Generate {count} certification exam flash cards for: {subcategory}. Front: key concept or question. Back: accurate answer with important details. Hint: memory aid or key distinction.",
  },
  {
    id: "languages",
    label: "Languages",
    icon: "🗣️",
    subcategories: ["Spanish", "French", "Mandarin"],
    promptTemplate: "Generate {count} language learning flash cards for {subcategory} vocabulary and grammar. Front: word/phrase in {subcategory} or grammar concept. Back: translation + pronunciation guide + example sentence. Hint: mnemonic or usage tip.",
  },
  {
    id: "sciences",
    label: "Sciences",
    icon: "🔬",
    subcategories: ["Quantum Physics", "Organic Chemistry", "Molecular Biology"],
    promptTemplate: "Generate {count} science flash cards for: {subcategory}. Front: concept, term, or reaction. Back: clear explanation with equations where relevant. Hint: real-world application or memory device.",
  },
  {
    id: "tech-topics",
    label: "Tech Topics",
    icon: "💻",
    subcategories: ["React", "Python", "SQL", "Data Structures", "Machine Learning"],
    promptTemplate: "Generate {count} technical flash cards for: {subcategory}. Front: concept, method, or question. Back: concise explanation with code snippet or example where helpful. Hint: common pitfall or best practice.",
  },
  {
    id: "custom",
    label: "Custom Topic",
    icon: "✏️",
    subcategories: ["Custom"],
    promptTemplate: "Generate {count} flash cards for the topic: {subcategory}. Front: key question or concept. Back: clear, concise answer (2-3 sentences max). Hint: memory aid or key point.",
  },
];
