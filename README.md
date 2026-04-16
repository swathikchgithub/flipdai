# 🚀 FlipDAI

FlipDAI is an AI-powered study platform that transforms any topic into interactive flashcards and quizzes. Built with Next.js, it leverages advanced Language Models to generate high-quality study materials and provide real-time feedback on student answers.

**🌐 Live Demo: [https://flipdai.vercel.app/](https://flipdai.vercel.app/)**

## ✨ Features

- **AI-Powered Card Generation**: Instantly generate flashcards for subjects like AP Psychology, SAT Prep, Tech Topics (React, Python), Job Interviews, and more.
- **Interactive Flashcard Mode**: 3D flip animations with support for hints and manual/AI-evaluated answers.
- **Smart Quiz Mode**: Auto-generated multiple-choice questions with intelligent answer validation and auto-advancement.
- **Voice Control (TTS & STT)**:
  - **Text-to-Speech (TTS)**: Reads questions and answers aloud. Supports multiple browser voices/accents.
  - **Speech-to-Text (STT)**: Allows users to speak their answers instead of typing.
- **AI Evaluation**: Real-time scoring and feedback on typed/spoken answers using LLMs.
- **Session History**: Track your progress and review previous study sessions.
- **Modern UI/UX**: Clean, centered layout designed for focus, responsive across all devices.
- **Multiple AI Providers**: Support for OpenAI, Anthropic, Google (Gemini), Groq, and OpenRouter.

## 🛠️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **AI Integration**: [Vercel AI SDK](https://sdk.vercel.ai/)
- **Testing**: [Playwright](https://playwright.dev/)
- **State Management**: React Hooks (useState, useEffect, useRef, useCallback)
- **Voices**: Web Speech API (Synthesis & Recognition)

## 📂 Project Structure

```text
flipdai/
├── app/                  # Next.js App Router (Pages & API)
│   ├── api/              # AI endpoints (Generate & Evaluate)
│   ├── history/          # Past session dashboard
│   └── study/            # Dynamic study session (Flashcards/Quiz)
├── components/           # Modular UI components
│   ├── CardFlipper.tsx   # Core 3D Flashcard component
│   └── QuizMode.tsx      # Multiple-choice quiz component
├── config/               # App configuration
│   ├── topics.ts         # Study categories registry
│   └── constants.ts      # AI model settings
├── lib/                  # Core logic & utilities
│   ├── voice-utils.ts    # STT and TTS engine
│   └── storage.ts        # LocalStorage persistence
├── public/               # Static assets
└── tests/                # Playwright E2E test suites
```

### 🔍 Detailed Codepath

- `/app`: 
  - `page.tsx`: Landing page with topic selection.
  - `study/[sessionId]/page.tsx`: Main study session logic (Flashcards/Quiz switching).
  - `history/page.tsx`: Session history dashboard.
  - `api/`: Backend routes for card generation and answer evaluation.
- `/components`:
  - `CardFlipper.tsx`: 3D flashcard component with mic input.
  - `QuizMode.tsx`: Multiple-choice quiz logic with TTS.
  - `ProgressBar.tsx`: Visual session progress tracking.
  - `StudyStats.tsx`: Real-time score and category breakdown.
- `/lib`:
  - `voice-utils.ts`: Core logic for STT (Recognition) and TTS (Synthesis).
  - `flashcard-types.ts`: TypeScript interfaces for cards and sessions.
  - `storage.ts`: LocalStorage management for session persistence.
- `/config`:
  - `topics.ts`: Registry of study categories and subcategories.
  - `flipdai-constants.ts`: Model definitions and default settings.
- `/tests`: Comprehensive Playwright test suite covering UI, generation, and edge cases.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- NPM / PNPM / Yarn
- API Keys for one of the supported providers (OpenAI, Anthropic, etc.)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/swathikch/flipdai.git
   cd flipdai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add your API keys:
   ```env
   OPENAI_API_KEY=your_key_here
   ANTHROPIC_API_KEY=your_key_here
   GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
   GROQ_API_KEY=your_key_here
   OPENROUTER_API_KEY=your_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to start studying!

## 🧪 Testing

The project uses Playwright for end-to-end testing.

```bash
# Run all tests
npx playwright test

# Run tests in UI mode
npm run test:ui

# Run tests for a specific project
npx playwright test --project=chromium
```

## 📜 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by [Swathik CH](https://github.com/swathikchgithub)
