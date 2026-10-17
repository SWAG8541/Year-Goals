# Backend

Requires Node.js 20.12+ and MongoDB. Copy `.env.example` to `.env`, set your values, run `npm install`, and start with `npm run dev`. Existing process environment variables take precedence over `.env`.

```text
server/
  index.ts       Database connection and HTTP server startup
  app.ts         Express application and middleware wiring
  config/        Environment loading and database connection
  models/        Mongoose schemas and models
  routes/        API paths and authentication middleware
  controllers/   Request validation and HTTP responses
  services/      Business logic and database operations
  middleware/    Authentication, request logging, error handling
  validators/    Zod schemas and API types
  utils/         JWT/password helpers, errors, logging, WhatsApp links
  .env.example   Environment variable template
```

Each feature follows routes → controllers → services → models. Features include authentication, goals, tasks, blog, feed, calendar days, user goals, analytics, attendance, and WhatsApp reminders. All existing `/api` paths are preserved.

The frontend runs separately. `utils/static.ts` remains available for applications that explicitly choose to serve a client build.

Run `npm run check` to check backend types and `npm test` for regression checks without MongoDB.

### Google sign-in

Set `FIREBASE_PROJECT_ID` in `server/.env` to the same value as the client's
`VITE_FIREBASE_PROJECT_ID`. Enable Google under Firebase Authentication providers
and authorize the frontend domain. Restart the server after changing environment values.

The client posts `{ idToken }` to `/api/auth/google`. Firebase Admin verifies its
signature, expiry, issuer, and audience before the server finds or creates the user
and returns an application JWT and cookie. Token verification fetches Google's
public keys and requires network access. This flow does not check token revocation;
adding revocation checks requires Firebase Admin credentials. Never log ID or refresh tokens.

### Render deployment

Local `.env` files are ignored by Git and are not deployed. Set `MONGODB_URI`,
`JWT_SECRET`, `FIREBASE_PROJECT_ID`, and `CORS_ORIGIN` in the Render backend
service's Environment settings, then restart/redeploy. The Firebase project must
match the deployed frontend's `VITE_FIREBASE_PROJECT_ID` (currently `years-goal`
in `client/env.example`). Set `CORS_ORIGIN` to the frontend origin
(`https://yeargoals.onrender.com`). Frontend `VITE_` changes require a rebuild.

For a Google login 500, find the response's `requestId` in backend logs.
`auth/missing-project-id` identifies missing backend Firebase configuration. The
last logged stage distinguishes verification from database/session failures.
Never share tokens or database connection strings in bug reports.
