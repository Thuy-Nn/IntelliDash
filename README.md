## IntelliDash

Live app: https://intellid.web.app/

IntelliDash is an AI-powered data analytics dashboard that turns uploaded datasets into an interactive dashboard with automatically generated visualizations.

![IntelliDash Architecture](IntelliDash%20-%20Overview.jpg)

### Repository structure

- `IntelliDash_HP/` – Next.js (App Router) frontend, exported as a static site 
- `Server/` – Python/Flask REST API that runs the agent pipeline (ingestion -> cleaning -> analytics -> visualization)

### Tech stack

- Frontend: Next.js, React, Recharts
- Backend: Flask + CORS, LangGraph, OpenAI, Pandas/NumPy, Plotly
- Deployment: Firebase Hosting (frontend), Cloud Run (backend)

## Local development

### 1) Frontend 

Prereqs: Node.js + npm.

```bash
cd IntelliDash_HP
npm install
npm run dev
```

Then open http://localhost:3000

### 2) Backend 

Prereqs: Python 3.10 + recommended.

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
	- Allowed types (backend): `csv`, `xlsx`
	- Response contains `dashboard` (the generated visualization spec used by the frontend)

The frontend’s upload panel currently allows `CSV`, `XLSX`, `XLS` and limits size to 10MB.



