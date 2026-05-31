# NavratnaDevs 🇮🇳
### *Your idea. 9 agents. One product.*

> Not a vibe coding tool. An entire AI software company — 9 specialist agents who debate, disagree, vote, build, test, and ship your idea while you play Tech Lead.

---

## What Is This?

NavratnaDevs is an AI-powered software company simulator. You type a product idea. Nine specialist AI agents collaborate (and argue) to build it:

| Agent | Role | Personality |
|-------|------|-------------|
| 🧠 Priya (PM) | PRD, roadmap, user stories | Ambitious, feature-hungry |
| 🏗️ Arjun (Architect) | System design, tech stack | Minimalist, cuts scope |
| 🎨 Disha (Designer) | UI/UX, design system | UX-obsessed |
| ⚙️ Bharat (Backend) | API routes, DB, auth | Pragmatic, precise |
| 🖥️ Farhan (Frontend) | React, state, routing | Opinionated, argues with Bharat |
| 🔍 Qadir (QA) | Bugs, tests, edge cases | Pessimist, always finds problems |
| 🔐 Shreya (Security) | OWASP audit, vulnerabilities | Paranoid, blocks everything first |
| 📈 Dev (DevOps) | Docker, CI/CD, deploy | Silent, efficient |
| 📊 Ananya (Analytics) | KPIs, tracking, funnels | Data-obsessed |

---

## Tech Stack

- **Backend:** FastAPI (Python)
- **Frontend:** Next.js 14 (TypeScript)
- **Database:** Supabase (PostgreSQL + Realtime)
- **AI:** Groq API — Llama 3.3 70B (free, fastest inference)
- **Realtime:** WebSockets
- **Deploy:** Vercel (frontend) + Railway (backend)
- **Cost:** $0

---

## Quick Start

### 1. Clone
```bash
git clone https://github.com/yourusername/navratnadevs
cd navratnadevs
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Fill in your keys (Groq, Supabase)
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Database Setup
```bash
# Go to Supabase → SQL Editor
# Paste and run: database/schema.sql
```

### 4. Frontend Setup
```bash
cd frontend
cp .env.example .env.local
# Fill in NEXT_PUBLIC_API_URL=http://localhost:8000
npm install
npm run dev
```

### 5. Open
```
http://localhost:3000
```

---

## Environment Variables

### Backend `.env`
```
GROQ_API_KEY=          # Get free at console.groq.com
SUPABASE_URL=          # Your Supabase project URL
SUPABASE_SERVICE_KEY=  # Supabase service role key
UPSTASH_REDIS_URL=     # Optional: for queuing
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## Deployment

### Frontend → Vercel
```bash
cd frontend
npx vercel --prod
```

### Backend → Railway
1. Connect GitHub repo to Railway
2. Set root directory: `backend`
3. Add environment variables
4. Deploy

---

## How It Works

```
User types idea
      ↓
PM Priya writes PRD
      ↓
Architect Arjun challenges PM → DEBATE visible
      ↓
PM defends → VOTE → winner decided
      ↓
Designer Disha creates UI spec
      ↓
Backend Bharat + Frontend Farhan argue about API
      ↓
QA Qadir finds 5+ bugs (always)
      ↓
Security Shreya flags vulnerabilities
      ↓
DevOps Dev packages everything
      ↓
Analytics Ananya adds tracking
      ↓
Complete codebase + Builder DNA generated
```

---

## Built For
OpenAI × Outskill AI Builders Hackathon 2025

*Navratna (नवरत्न) = Nine Gems — the legendary council of nine brilliant minds in Indian history.*
