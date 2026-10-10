# Collaborative Task Manager

A responsive full-stack team task manager based on the supplied assessment. It includes JWT authentication, hashed passwords, role-based task permissions, task CRUD, task activity logs, dashboards, projects, requirements, sprints, test cases/runs, bug tracking, release records, dark mode, search, CSV export, rate limiting, Docker support, and API documentation.

## Stack
- React 18, React Router, Tailwind CSS, Lucide icons
- Node.js, Express, Mongoose, MongoDB
- JWT, bcryptjs, Helmet, CORS, express-rate-limit
- Socket.IO server dependency is configured for future/live event expansion

## Requirements
- Node.js 20+ and npm
- MongoDB 7+ (local service or MongoDB connection string)

## Run locally (Windows PowerShell or terminal)
1. Copy `.env.example` to `backend/.env` (the same template is also available at `backend/.env.example`). Set a long random `JWT_SECRET`; adjust `MONGODB_URI` if needed.
2. Install dependencies:
   ```bash
   npm install
   npm --prefix backend install
   npm --prefix frontend install
   ```
3. Start MongoDB.
4. In one terminal, run the API: `npm run server` (or `cd backend && npm run dev`).
5. In another terminal, run the UI: `npm run client` (or `cd frontend && npm run dev`).
6. Open `http://localhost:5173`. API health: `http://localhost:5000/api/health`.

## Demo users
Run `cd backend && npm run seed` after configuring `.env`. This creates local demo accounts with the same password `Demo1234!`:
- `manager@example.com` — Manager
- `user@example.com` — User
- `developer@example.com` — Developer
- `qa@example.com` — QA Tester

These are local-only sample credentials. Do not use them on a public deployment. Public signup intentionally creates only the basic User role. Managers create additional role accounts from Team & Roles.

## Core permissions
- **Manager:** create, assign, edit and delete tasks; manage team accounts and advanced records; inspect activity.
- **User:** view assigned tasks and update their own task status / add comments.
- **Developer:** view assigned work, add technical progress and code links, and use project/requirement workflows allowed by the API.
- **QA Tester:** access the QA queue, create test cases/runs, track defects and release QA records.
- Permissions are enforced by backend middleware and route logic, not only by UI visibility.

## Feature notes
- Tasks have status, priority, assignment history, due/start dates, estimate/logged hours, blocker fields, branch/PR/commit links, QA-required/sign-off flags, comments, and separate activity history.
- Advanced objects use a flexible MongoDB `Record` model with resource-specific UI forms. Requirements can store acceptance criteria and linked task IDs; test cases/runs, bugs and releases keep their own fields.
- `GET /api/tasks` supports search, status, priority, assignee, sprint, page, and limit filters. CSV export is available for advanced record lists.
- Dark mode is persistent in the browser. Loading, empty, validation and error states are included.

## Docker
From the project root, set `JWT_SECRET` in your environment and run `docker compose up --build`. UI is served at `http://localhost:8080`, API at `http://localhost:5000`. For production, configure the public API URL, secure secrets, TLS, CORS origins, backups, and account provisioning.

## Tests and documentation
- Backend smoke/permission rule tests: `cd backend && npm test`
- API endpoints and payloads: [`docs/API.md`](docs/API.md)
- Five-minute demo guide: [`docs/DEMO_WALKTHROUGH.md`](docs/DEMO_WALKTHROUGH.md)
- API health endpoint: `GET /api/health`

## Security / production checklist
- Configure a strong unique `JWT_SECRET`, HTTPS and production CORS allowlist.
- Add account verification, password reset, refresh-token rotation/revocation, and a production secret manager before public deployment.
- Review advanced-record validation and replace the flexible `Record` data object with dedicated schemas if strict reporting/traceability guarantees are required.
- Automated tests currently cover core permission rules and QA completion guard; add integration tests against a disposable MongoDB instance before release.

## AI assistance disclosure
AI assistance was used to draft the application structure, implementation code, setup documentation, and demo walkthrough. Review, test, and adapt the generated code before production use.
