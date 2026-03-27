# Deployment

Recommended architecture:

- Frontend: Vercel
- Backend API: Render
- Database: Supabase Postgres

## Frontend on Vercel

The root [`vercel.json`](/d:/busticket_booking/vercel.json) builds the Angular app from `frontend/`.

Set this environment variable in the Vercel project:

```text
FRONTEND_API_URL=https://your-render-service.onrender.com/api
```

Deploy command flow:

```bash
npx vercel
npx vercel env add FRONTEND_API_URL
npx vercel --prod
```

## Backend on Render

The root [`render.yaml`](/d:/busticket_booking/render.yaml) defines the Flask API service.

Set these environment variables in Render:

```text
DATABASE_URL=postgresql://postgres:PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
JWT_SECRET_KEY=replace-with-a-long-random-secret
CORS_ORIGINS=https://your-project.vercel.app,https://your-custom-domain.com
JWT_ACCESS_TOKEN_EXPIRES_HOURS=12
```

Note:

- if the database password contains `@`, use `%40` in `DATABASE_URL`
- a local reference file is available at [`backend/.env.render`](/d:/busticket_booking/backend/.env.render)
- local development is unchanged because the backend still reads local `.env` or falls back to SQLite

Render will:

- install from `backend/requirements.txt`
- start the API with `gunicorn "app:create_app()"`
- expose the health endpoint at `/api/health`

## Database

Use hosted PostgreSQL, not SQLite, for deployment.

Recommended:

- Supabase Postgres

## Local Development

- Frontend keeps using [`environment.ts`](/d:/busticket_booking/frontend/src/environments/environment.ts)
- Backend can still default to local SQLite for development
