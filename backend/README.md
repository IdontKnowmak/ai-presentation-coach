# AI Presentation Coach Backend

FastAPI backend with email/password registration, Google ID-token verification, JWT bearer authentication, per-user project ownership, temporary PDF/PPTX processing with extracted text stored in the database, and Cloudflare Workers AI question/evaluation endpoints.

## Run locally (Windows PowerShell)
```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
# Open .env and replace DATABASE_URL with your Neon connection string.
# Generate a private AUTH_SECRET_KEY with the command documented below.
# Edit .env, then:
uvicorn main:app --reload --port 8000
```

API docs: http://127.0.0.1:8000/docs

## Environment variables
- `DATABASE_URL`: set this in `backend/.env`. For Neon, use the connection string from the Neon dashboard with `postgresql+psycopg://USER:PASSWORD@HOST/DB?sslmode=require`. The backend loads `.env` relative to `main.py`, so it works even when launched from another working directory. Database tables are initialized on startup.
- `AUTH_SECRET_KEY`: **required for deployment**; generate a long random secret, for example `python -c "import secrets; print(secrets.token_urlsafe(48))"`. Never use the example/default value in production.
- `AUTH_TOKEN_MINUTES`: bearer token lifetime (default 60 minutes).
- `GOOGLE_CLIENT_ID`: Google Cloud OAuth 2.0 Web client ID used to verify Google Sign-In ID tokens. Must match frontend `VITE_GOOGLE_CLIENT_ID`.
- `CORS_ORIGINS`: comma-separated exact frontend origins.
- `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_MODEL`: backend-only Cloudflare Workers AI configuration. The default model is `@cf/zai-org/glm-4.7-flash`; the API token must have Workers AI permissions.
- Original PDF/PPTX files are not stored. The backend uses a temporary file to extract text, stores extracted text and metadata in the database, and deletes the temporary file even when processing fails. Google Drive API access is not required; Google OAuth is used only for Google Sign-In.
- `MAX_UPLOAD_MB`, `MAX_EXTRACTED_CHARS`: upload/extraction limits.

## Authentication endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create an account and return a bearer token |
| POST | `/api/auth/login` | Verify email/password and return a bearer token |
| POST | `/api/auth/google` | Verify a Google ID token and sign in/register |
| GET | `/api/auth/me` | Return the current authenticated account |
| GET | `/health` | Health/configuration status, including Cloudflare AI configuration |
| POST | `/api/ai/test` | Test Cloudflare Workers AI (requires sign-in) |

All project, presentation, and practice-session endpoints require `Authorization: Bearer <access_token>`. Resource lookups are scoped to the authenticated account. The token is held in browser localStorage by this prototype; consider moving to secure HttpOnly cookies and adding rate limiting, password reset, email verification, and monitoring before a public production launch.

## Other API endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| GET/POST | `/api/projects` | List/create owned projects |
| GET/PATCH/DELETE | `/api/projects/{id}` | Read/update/delete an owned project |
| POST | `/api/projects/{id}/presentations` | Upload PDF/PPTX and extract text |
| GET | `/api/presentations/{id}` | Read extracted text and questions |
| POST | `/api/presentations/{id}/generate-questions` | Generate questions with Cloudflare Workers AI |
| POST | `/api/sessions` | Create a practice session |
| POST | `/api/sessions/{id}/evaluate` | Evaluate and save an answer |
| POST | `/api/sessions/{id}/complete` | Complete a session |
| GET | `/api/sessions/{id}/answers` | Read saved answers |
| GET | `/api/projects/{id}/sessions` | List sessions for an owned project |
| GET | `/api/projects/{id}/recommendations` | Build recommendations from saved scores and feedback without an AI call |

## Notes
- A startup compatibility step adds `projects.user_id` to older databases; legacy projects are left unassigned and therefore hidden from user accounts.
- Scanned/image-only PDFs need OCR, which is not included.
- PowerPoint `.ppt` is not supported; use `.pptx` or PDF.
- Keep API secrets out of source control. `.env.example` contains placeholders only; never put real credentials there. If a real database password was previously committed or shared, rotate it in Neon and update `backend/.env`.
- AI feedback may be inaccurate; verify it against the slides and instructor rubric. Workers AI includes 10,000 free Neurons per day; the quota resets at 00:00 UTC. Monitor usage in Cloudflare and keep prompts/output concise. Requests can fail when the daily free quota or model capacity is exhausted.
