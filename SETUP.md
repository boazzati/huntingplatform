# AFH Hunting Engine - Setup Instructions

## Prerequisites

- Node.js 22.x
- npm 10.x or pnpm
- MongoDB Atlas account (or local MongoDB)
- OpenAI API key
- GitHub account

## Local Development Setup

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   npm install
   ```

2. Create `.env` file in `backend/` directory:
   ```
   PORT=3001
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hunting
   OPENAI_API_KEY=sk-your-openai-api-key
   CRAWL4AI_URL=http://localhost:8000
   NODE_ENV=development
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

   Server will run on `http://localhost:3001`
   API docs available at `http://localhost:3001/api/docs`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   npm install
   ```

2. Create `.env` file in `frontend/` directory:
   ```
   VITE_API_BASE_URL=http://localhost:3001
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

   App will run on `http://localhost:5173`

## Building for Production

### Backend Build
```bash
cd backend
npm run build
npm run start
```

### Frontend Build
```bash
cd frontend
npm run build
```

## Deployment

### Netlify (Frontend)

1. Connect GitHub repository to Netlify
2. Set build command: `cd frontend && npm run build`
3. Set publish directory: `frontend/dist`
4. Add environment variable: `VITE_API_BASE_URL`

### Railway (Backend)

1. Connect GitHub repository to Railway
2. Create MongoDB service (or use external MongoDB)
3. Set environment variables:
   - `MONGODB_URI`
   - `OPENAI_API_KEY`
   - `CRAWL4AI_URL`
   - `NODE_ENV=production`
   - `PORT=3001`

## API Endpoints

- `GET /health` - Health check
- `POST /api/hunts` - Create hunt
- `GET /api/hunts` - List hunts
- `GET /api/hunts/:id` - Get hunt details
- `DELETE /api/hunts/:id` - Delete hunt
- `POST /api/playbooks/:subChannel` - Generate playbook
- `GET /api/playbooks/:subChannel` - Get playbook
- `GET /api/playbooks` - List all playbooks
- `GET /api/docs` - Swagger documentation

## Testing

### Backend Tests
```bash
cd backend
npm run test
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB URI is correct
- Check IP whitelist in MongoDB Atlas
- Verify credentials

### OpenAI API Errors
- Verify API key is valid
- Check account has sufficient credits
- Ensure rate limits aren't exceeded

### Frontend Build Issues
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf dist`

## Environment Variables Reference

### Backend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 3001 |
| MONGODB_URI | MongoDB connection string | mongodb+srv://... |
| OPENAI_API_KEY | OpenAI API key | sk-... |
| CRAWL4AI_URL | Crawl4AI service URL | http://localhost:8000 |
| NODE_ENV | Environment | development/production |

### Frontend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| VITE_API_BASE_URL | Backend API URL | http://localhost:3001 |

## Support

For issues or questions, please refer to the main README.md or contact the development team.
