# Five-minute demo walkthrough

1. Start MongoDB and both applications as described in the root README.
2. Sign in as `manager@example.com` with the seeded demo password. Open **Team & Roles** and confirm the Manager, User, Developer, and QA Tester accounts.
3. Open **My Tasks** → **New task**. Add a title, description, assign it to Taylor User, set a priority and due date, and save.
4. Sign out and sign in as `user@example.com`. Open **My Tasks**, find the assigned task, and update its status to **In Progress** or **Completed**.
5. Sign out and return as the Manager. Show the updated status and open the task's history icon to show creation and status-change events.
6. For advanced workflow: create a project, add a requirement with acceptance criteria, create a sprint, link IDs in requirement/task records, create test cases, record a test run, log a bug, and create a release sign-off record.

Demo accounts are for local development only. Change passwords and JWT secrets before deploying.
