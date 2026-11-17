# Whisper

Whisper is an anonymous confessions and community app built with TanStack Start, PostgreSQL, and a Node.js server. It includes email/password and guest sign-in, a global feed, reactions, bookmarks, reports, groups, private replies, and chat.

The interface pairs editorial Lora headings with Garamond serif body text, using a dark theme with high-contrast white text and red highlights.

Visitors can browse the public global feed without an account. Posting, sharing, bookmarking, reacting, and other account actions require a signed-in session; guest sessions count as signed in. Group content remains behind the authenticated member routes.

## Project structure

- `frontend/src` contains the TanStack Start app, routes, UI, and client-safe server-function wrappers.
- `backend/src` contains PostgreSQL access and server-only application logic; `backend/db/migrations` contains schema migrations.
- `shared` contains validation schemas used by both sides of the app.
- These source folders are built and deployed together as one Node.js service.

## Requirements

- Node.js 22.12 or newer
- PostgreSQL 13 or newer
- A Node-compatible hosting provider and a PostgreSQL connection string

## Local development

1. Copy `.env.example` to `.env` and set `DATABASE_URL`. Local dev, migration, and start commands load `.env` automatically.
2. Install dependencies with `npm install`.
3. Apply the schema using `npm run db:migrate`.
4. Start the development server with `npm run dev`.

The app listens on Vite's development port. Guest accounts are tied to the browser's secure session cookie; signing out or clearing browser data means that guest account cannot be recovered.

## Production deployment

1. Create a PostgreSQL database and a Node.js service on your hosting provider.
2. Configure these environment variables on the service:
   - `DATABASE_URL` — PostgreSQL connection URL. Keep it private.
   - `DATABASE_SSL=true` when your provider requires TLS and supplies a trusted certificate.
   - `DATABASE_POOL_SIZE` — optional per-instance pool size; default is 10. Set it in coordination with your provider's connection limit and number of app instances.
   - `NODE_ENV=production`.
3. Use Node.js 22.12 or newer.
4. Configure the service's pre-deploy/release command as `npm run db:migrate`.
5. Configure the build command as `npm ci && npm run build`.
6. Configure the start command as `npm start`. It serves the current `dist/server` build with Node's HTTP server.
7. Set the health-check path to `/healthz`.
8. Serve the app over HTTPS. Production session cookies are marked `Secure`.

Migrations are ordered SQL files in `backend/db/migrations`. The migration runner records applied filenames and runs each migration transactionally. Run migrations once per deployment, not once per application replica.

The migration sequence adds six sample confessions from non-login guest accounts to the public feed. These demo posts are visible in every environment where migrations are applied.

## Security and operations

- Passwords use Node's `scrypt`; session tokens are random, stored only as hashes in PostgreSQL, and sent in `HttpOnly`, `SameSite=Lax` cookies.
- All data access runs server-side through parameterized PostgreSQL statements and enforces user/group/chat ownership checks.
- The database is never accessed directly from the browser. Do not expose `DATABASE_URL` as a `VITE_*` variable.
- Use a managed database backup/restore plan and review its retention and point-in-time recovery settings before launch.
- Chat and feed changes refresh by polling; this deployment does not require a separate realtime service.
- Moderation is not automated. Posts are length-validated, and users can report content for review.
- Configure your hosting provider's trusted proxy settings and HTTPS before accepting production traffic.

## Existing data migration

This deployment uses a new PostgreSQL schema and local application authentication. Existing users and data are not migrated automatically. Export and transform legacy data before production cutover; password hashes from an external identity provider may not be compatible with this app.
