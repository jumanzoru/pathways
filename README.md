# Triton Pathways

An AI-powered course and club planner for UC San Diego students.  
Currently **in active development** (MVP sprint: 17 days).

---

## 🚧 Project Status

This project is in progress as part of a **17-day MVP build plan**.  
The goal: ship a working full-stack prototype by the end of the sprint.  

**Current progress:**  
- ✅ Next.js + TypeScript frontend scaffold  
- 🚧 PostgreSQL + Prisma backend setup  
- 🚧 AI integration with GPT-4o + LangChain  
- 🚧 Clerk authentication & user profiles  
- 🚧 Docker + AWS deployment pipeline  

Daily progress is tracked in `docs/plan.md`.

---

## ⚡ Features (Planned for MVP)

- **Course Scheduling** – drag-and-drop UCSD course planner  
- **Club Discovery** – recommendations tailored to user schedules  
- **Smart AI Suggestions** – GPT-4o powered academic/club balance advice  
- **Secure Accounts** – login and persistence with Clerk + PostgreSQL  
- **Cloud Deployment** – containerized with Docker, running on Vercel + AWS  

---

## 🛠️ Tech Stack

**Frontend**: Next.js (App Router), React, TypeScript, TailwindCSS  
**Backend**: FastAPI + Node.js API routes  
**Database**: PostgreSQL + Prisma ORM  
**AI/ML**: OpenAI GPT-4o, LangChain  
**Infrastructure**: Docker, AWS (S3/EC2), Vercel  

---

## 🚀 Getting Started (Dev Mode)

### Prerequisites
- Node.js (v18+)  
- PostgreSQL (local or Dockerized)  

### Development
```bash
git clone https://github.com/jumanzor/triton-pathways.git
cd triton-pathways
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment
Copy `.env.example` → `.env.local` and configure:
```bash
DATABASE_URL=...
OPENAI_API_KEY=...
CLERK_SECRET_KEY=...
```

---

## 📌 Notes

This README will expand as milestones are completed.  
For now, Triton Pathways is a **work-in-progress MVP sprint**, targeted for completion in 17 days.  
Stay tuned for updates as the project evolves!
