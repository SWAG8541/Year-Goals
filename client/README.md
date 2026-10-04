# Client environment

Copy `.env.example` to `.env` and set the backend base URL:

```env
VITE_API_BASE_URL=http://localhost:4255
```

Run `npm install` and `npm run dev`. Restart the client dev server after changing `.env`.

`src/config/env.ts` reads and normalizes the URL. `src/lib/api.ts` provides `apiUrl('/api/...')`, which is used by all backend fetch requests and the shared React Query helpers. Include only the backend base URL, without `/api`.

The backend's `CORS_ORIGIN` must match the frontend origin, for example `http://localhost:8541`.

For deployment, set `VITE_API_BASE_URL` to your backend URL before running `npm run build`. Vite embeds the value at build time, so changing it after building requires a rebuild. Values prefixed with `VITE_` are public browser configuration; keep database credentials and JWT secrets on the backend.

See https://vite.dev/guide/env-and-mode for Vite's environment loading behavior.
