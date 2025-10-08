# DemoShop Full Stack

A full-stack e-commerce demo application with React frontend and Python backend.

## Repository Structure

```
demoshop-fullstack/
├── backend/          # Python FastAPI backend (formerly api-insight)
├── frontend/         # React + Vite frontend (formerly demoshop-ui)
├── docker-compose.yaml
└── README.md
```

## Quick Start

### Using Docker Compose (Recommended)

Run the entire application stack with a single command:

```bash
docker-compose up
```

This will start:
- **Redis** on port 6379
- **Backend API** on http://localhost:8000
- **Frontend UI** on http://localhost:5173

Access the application at: http://localhost:5173

### Manual Setup

#### Backend

```bash
cd backend
pip install -r requirements.txt
python src/main.py
```

Backend will be available at http://localhost:8000

See [backend/README.md](./backend/README.md) for more details.

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at http://localhost:5173

See [frontend/README.md](./frontend/README.md) for more details.

## Architecture

### Backend
- **Framework**: FastAPI (Python)
- **Database**: Redis
- **API Documentation**: Available at http://localhost:8000/docs

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **UI Library**: shadcn/ui + Tailwind CSS
- **Routing**: React Router

## Development

### Running Tests

**Backend:**
```bash
cd backend
pytest
```

**Frontend:**
```bash
cd frontend
npm run lint
```

### Environment Variables

**Backend:**
- `REDIS_HOST`: Redis server host (default: localhost)
- `REDIS_PORT`: Redis server port (default: 6379)

**Frontend:**
- `VITE_API_URL`: Backend API URL (default: http://localhost:8000)

## Git History

This monorepo preserves the full git history from both original repositories:
- Backend history from `letsramp/api-insight`
- Frontend history from `letsramp/demoshop-ui`

To view history for a specific service:
```bash
# Backend history
git log -- backend/

# Frontend history
git log -- frontend/
```

## Syncing with Source Repositories

This monorepo maintains connections to the original repositories for manual syncing:

```bash
# Pull updates from backend source
git subtree pull --prefix=backend backend-origin main

# Pull updates from frontend source
git subtree pull --prefix=frontend frontend-origin main
```

## Contributing

Each service maintains its own dependencies and build processes. Please refer to the individual README files in `backend/` and `frontend/` directories for service-specific development guidelines.

## License

See individual service directories for license information.
