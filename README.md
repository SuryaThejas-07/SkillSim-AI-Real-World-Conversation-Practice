# SkillSim AI

Practice real-world conversations with AI characters to improve communication skills in interviews, sales, negotiation, and workplace scenarios.

## What This Project Does

SkillSim AI lets users:

- choose a communication category
- select an AI character with a specific personality and difficulty
- run a live practice conversation
- receive AI-generated feedback and track progress on a dashboard

## Core Features

- AI conversation simulation by category
- character-based role play (difficulty + personality)
- session history and progress tracking
- feedback scoring and actionable tips
- responsive UI with light/dark theme support

## Screenshots

Place your screenshots in `public/screenshots/` with these filenames, and GitHub will render them in this README:

- `home.png`
- `categories.png`
- `characters.png`
- `simulation.png`
- `feedback.png`
- `dashboard.png`

### Home
![Home](public/screenshots/home.png)

### Categories
![Categories](public/screenshots/categories.png)

### Characters
![Characters](public/screenshots/characters.png)

### Simulation
![Simulation](public/screenshots/simulation.png)

### Feedback
![Feedback](public/screenshots/feedback.png)

### Dashboard
![Dashboard](public/screenshots/dashboard.png)

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Firebase
- OpenAI-compatible API providers (Groq/OpenAI/etc.)

## Local Setup

### 1. Clone and install

```sh
git clone <YOUR_REPO_URL>
cd simulate-speak
npm install
```

### 2. Configure environment

Create `.env.local` based on `.env.example`.

Example (Groq):

```env
VITE_OPENAI_API_KEY=gsk_your-key
VITE_OPENAI_API_BASE=https://api.groq.com/openai/v1
VITE_OPENAI_MODEL=llama-3.3-70b-versatile
```

### 3. Run development server

```sh
npm run dev
```

### 4. Build for production

```sh
npm run build
```

## Security Notes

- Keep `.env.local` private.
- Never commit real API keys.
- For production, use server-side/API proxy handling for secrets when possible.

## Deployment

Deploy the build output (`dist/`) to any static host (Vercel, Netlify, GitHub Pages, etc.).
