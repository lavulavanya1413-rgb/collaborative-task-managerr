# API reference
Base URL: `http://localhost:5000/api`

All protected endpoints require `Authorization: Bearer <JWT>`. Responses are JSON.

## Authentication
- `POST /auth/signup` — `{ name, email, password }`; public signup creates a `User` role only.
- `POST /auth/login` — `{ email, password }`; returns `{ token, user }`.
- `GET /auth/me` — current session.
- `GET /auth/users` — team directory (Manager, Developer, QA Tester).
- `POST /auth/users` — manager provisions a user `{ name, email, password, role }`.

## Tasks
- `GET /tasks?search=&status=&priority=&assignee=&sprint=&page=1&limit=50` — visible tasks with pagination.
- `POST /tasks` — manager creates and assigns tasks; developers may create tasks assigned to themselves.
- `GET /tasks/:id` — task detail subject to access rules.
- `PATCH /tasks/:id` — managers edit all task fields; assignees can update status and add comments; developers can update their technical progress fields. QA may update QA-queue task status/comments.
- `DELETE /tasks/:id` — manager only.
- `GET /tasks/:id/activity` — activity history.

Task status values: `Backlog`, `To Do`, `In Progress`, `Code Review`, `Ready for QA`, `Rework`, `Done`, `Completed`. Priority: `Low`, `Medium`, `High`, `Critical`. QA-required tasks cannot be marked `Done` until signed off.

## Advanced records
Generic record endpoints keep the feature types extensible. Record data is stored in the `data` object.
- `GET|POST /records/projects` — Manager writes.
- `GET|POST|PATCH /records/requirements` — Manager/Developer writes.
- `GET|POST|PATCH /records/sprints` — Manager writes.
- `GET|POST|PATCH /records/testcases` — Manager/QA Tester writes.
- `GET|POST|PATCH /records/testruns` — Manager/QA Tester writes.
- `GET|POST|PATCH /records/bugs` — Manager/Developer/QA Tester writes.
- `GET|POST|PATCH /records/releases` — Manager/QA Tester writes.
- `DELETE /records/:type/:id` — Manager only.

`POST /records/:type` and `PATCH /records/:type/:id` accept `{ "data": { ... } }`. `GET /health` returns API status.
