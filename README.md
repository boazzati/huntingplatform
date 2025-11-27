# AFH Hunting Engine

A sophisticated business development automation platform for PepsiCo using the 10-step hunting model, powered by AI and web crawling.

## Project Structure

```
huntingplatform/
├── frontend/          # React + Shadcn/ui SPA for Netlify
├── backend/           # Express + TypeScript API for Railway
├── .gitignore
└── README.md
```

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Shadcn/ui + Tailwind CSS (UI components)
- React Query (data fetching)
- React Hook Form + Zod (form validation)
- Recharts (data visualization)

**Backend:**
- Node.js + Express
- TypeScript
- MongoDB + Mongoose (database)
- OpenAI API (ChatGPT)
- Crawl4AI (web crawling)
- Jest + Supertest (testing)
- Swagger/OpenAPI (documentation)

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   npm install
   ```

2. Create `.env` file with required variables:
   ```
   PORT=3001
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/hunting
   OPENAI_API_KEY=sk-...
   CRAWL4AI_URL=http://localhost:8000
   NODE_ENV=development
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   npm install
   ```

2. Create `.env` file:
   ```
   VITE_API_BASE_URL=http://localhost:3001
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## Deployment

**Frontend (Netlify):**
- Connected to GitHub
- Automatic builds on push to main
- Environment variables configured in Netlify dashboard

**Backend (Railway):**
- Connected to GitHub
- Automatic builds on push to main
- Environment variables configured in Railway dashboard

## API Endpoints

- `GET /health` - Health check
- `POST /api/hunts` - Create a new hunt
- `GET /api/hunts` - List all hunts
- `GET /api/hunts/:id` - Get hunt details
- `POST /api/playbooks/:subChannel` - Generate playbook
- `GET /api/docs` - Swagger documentation

## 10-Step Hunting Model

1. Define opportunity
2. Scan universe
3. Prioritise & score
4. Insight & hypothesis
5. PepsiCo value proposition
6. Internal/bottler alignment
7. Approach plan
8. Discovery & qualification
9. Proposal & negotiation
10. Pilot & learn

Each account tracks progress through all 10 steps with detailed notes.

## License

Proprietary - PepsiCo
