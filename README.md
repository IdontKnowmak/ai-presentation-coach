# AI Presentation Coach — Presently

React + Vite frontend and FastAPI backend with database-backed email/password authentication, optional Google Sign-In, per-user project ownership, and Cloudflare Workers AI for generating practice questions and evaluating answers.

## Project structure

```text
src/
├── main.jsx       # React app state, navigation, page components, and UI workflows
├── styles.css     # Global styles and responsive layouts
└── lib/
    └── api.js     # API URL, authentication-aware requests, and project data mapping
backend/
├── main.py        # FastAPI routes and backend application logic
├── requirements.txt
└── README.md      # Backend setup and environment variables
```

### Where to make common changes

- **API URL, access-token refresh, API errors:** `src/lib/api.js`
- **Page content, navigation, React state, and UI actions:** `src/main.jsx`
- **Colors, spacing, typography, and mobile layout:** `src/styles.css`
- **API endpoints, authentication, database, and AI requests:** `backend/main.py`
- **Environment variables:** root `.env.example` for the frontend and `backend/.env.example` for the backend

Keep secrets in backend environment variables; never place API tokens in frontend code.


## 1. Start the backend (Windows PowerShell)
```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
# Edit backend/.env, then:
uvicorn main:app --reload --port 8000
```

## 2. Start the frontend
In a second terminal at the project root:
```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Frontend: http://localhost:5173  
Backend API docs: http://127.0.0.1:8000/docs

## 3. Database and authentication
- Local development defaults to SQLite in `backend/presentation_coach.db`; for deployment, set `DATABASE_URL` to a Neon PostgreSQL connection string.
- Email/password registration stores an Argon2 password hash, never the raw password.
- API requests use a signed bearer token. Projects, presentations, and practice sessions are checked against the signed-in account.
- Google Sign-In uses a Google Cloud OAuth 2.0 Web client ID. Set the same ID in `backend/.env` as `GOOGLE_CLIENT_ID` and in the frontend `.env` as `VITE_GOOGLE_CLIENT_ID`, then add local/deployed frontend origins to Authorized JavaScript origins. Google Drive API access is not required.
- Before deployment, set `AUTH_SECRET_KEY` to a long random value, configure `CORS_ORIGINS`, and keep all backend secrets out of the frontend and Git.

For AI setup, add `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, and optionally `CLOUDFLARE_MODEL` to `backend/.env` (the default model is `@cf/zai-org/glm-4.7-flash`). Never put the Cloudflare API token in the frontend `.env`.

See [backend/README.md](backend/README.md) for environment variables and API details.

## Current limitations
Authentication, project CRUD, presentation upload, and practice endpoints are wired to the backend when configured. PDF/PPTX files are processed temporarily: the backend extracts slide text, saves the extracted text and metadata in the database, then deletes the temporary original file. Original PDF/PPTX files are not stored, so Google Drive is not required.
