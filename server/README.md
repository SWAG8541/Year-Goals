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
