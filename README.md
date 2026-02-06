## IntelliDash

Live app (Firebase Hosting): https://intellid.web.app/

IntelliDash is an AI-powered data analytics dashboard that turns uploaded datasets into an interactive dashboard with automatically generated visualizations.

![IntelliDash Architecture](IntelliDash%20-%20Overview.jpg)

The image above shows a high-level overview of the system. IntelliDash is a multi-agent system with four agents: ingestion, cleaning, analytics, and visualization. The pipeline combines logic-based agents with LLM-based reasoning agents.

### Repository structure

- `IntelliDash_HP/` – Next.js (App Router) frontend, exported as a static site and deployed to Firebase Hosting
- `Server/` – Python/Flask REST API that runs the agent pipeline (ingestion → cleaning → analytics → visualization)

### Tech stack

- Frontend: Next.js (static export), React, Recharts, Tailwind
- Backend: Flask + CORS, LangGraph/LangChain, OpenAI, Pandas/NumPy, Plotly
- Deployment: Firebase Hosting (frontend), Cloud Run (backend)

## Local development

### 1) Frontend (Next.js)

Prereqs: Node.js (recommended: latest LTS) + npm.

```bash
cd IntelliDash_HP
npm install
npm run dev
```

Then open http://localhost:3000

The frontend uploads files to the backend defined in `IntelliDash_HP/src/app/configs.js` (`API_ROOT`).

### 2) Backend (Flask API)

Prereqs: Python 3.10+ recommended.

```bash
cd Server
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

If you want to use the `/upload` route (Cloud Storage upload), you also need:

```bash
pip install google-cloud-storage
```

Set your OpenAI key (recommended: via environment variable):

- Windows (PowerShell): `setx OPENAI_API_KEY "YOUR_KEY"`
- Windows (cmd): `set OPENAI_API_KEY=YOUR_KEY`

Then run the API:

```bash
python main.py
```

By default it listens on `http://localhost:8080`.

## API

- `GET /` – health check
- `POST /upload` – multipart/form-data with field `file`
	- Allowed types (backend): `csv`, `xlsx`, `json`, `parquet`
	- Response contains `dashboard` (the generated visualization spec used by the frontend)

The frontend’s upload panel currently allows `CSV`, `XLSX`, `XLS` and limits size to 10MB.

## Configuration notes

### Frontend → backend URL

Update `API_ROOT` in `IntelliDash_HP/src/app/configs.js`:

- Local backend: `http://127.0.0.1:8080`
- Deployed backend (current): `https://dashboard-api-266780815120.europe-west3.run.app`

### Backend: OpenAI + Google Cloud

- `OPENAI_API_KEY` is required for the agent pipeline.
	- The pipeline loads `Server/agents/.env` (if present), but environment variables work as well.
- `/upload` uploads the raw file to Google Cloud Storage.
	- The bucket name is currently set in `Server/main.py` as `intellidash`.
	- Google credentials must be available via Application Default Credentials (e.g., `GOOGLE_APPLICATION_CREDENTIALS`), especially when running outside Cloud Run.

## Deployment

### Frontend (Firebase Hosting)

The frontend is configured for static export (`output: 'export'`) and Firebase Hosting serves the generated `out/` directory.

Prereqs:

- Firebase CLI installed (`npm i -g firebase-tools`)
- Logged in (`firebase login`)
- Firebase project configured (see `IntelliDash_HP/.firebaserc`)

```bash
cd IntelliDash_HP
npm run one-click-deploy
```

This runs `next build` and then `firebase deploy --only hosting`.

### Backend (Cloud Run)

The repository includes a Flask app in `Server/main.py`. Deploy it to Cloud Run with the required runtime environment variables/secrets (at minimum `OPENAI_API_KEY`) and permissions to write to your GCS bucket.

