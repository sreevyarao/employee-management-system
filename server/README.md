# EMS Server

This is the Express + MongoDB backend for the Employee Management System.

## Setup

1. Open a terminal in this folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in this folder with at least:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/ems
   JWT_SECRET=your_secure_jwt_secret
   CLIENT_URL=http://localhost:5173
   ```
4. Seed demo data if needed:
   ```bash
   npm run seed
   ```

## Run

```bash
npm run dev
```

The API listens on `http://localhost:5000`.

## Route map

### API routes

| Method | Route | Middleware | Notes |
| --- | --- | --- | --- |
| GET | `/api/health` | none | Health check |
| POST | `/api/auth/login` | none | Sign in and set auth cookie |
| POST | `/api/auth/logout` | none | Clears the auth cookie |
| GET | `/api/auth/profile` | `protect` | Current user profile |
| PUT | `/api/auth/change-password` | `protect` | Change password |
| GET | `/api/employees` | `protect` | Search + filter + pagination |
| POST | `/api/employees` | `protect + isAdmin` | Create employee |
| GET | `/api/employees/:id` | `protect` | Employee detail |
| PUT | `/api/employees/:id` | `protect + isAdmin` | Update employee |
| DELETE | `/api/employees/:id` | `protect + isAdmin` | Delete employee |
| GET | `/api/projects` | `protect` | Search + filter + pagination |
| POST | `/api/projects` | `protect + isAdmin` | Create project |
| GET | `/api/projects/:id` | `protect` | Project detail |
| PUT | `/api/projects/:id` | `protect + isAdmin` | Update project |
| DELETE | `/api/projects/:id` | `protect + isAdmin` | Delete project |
| POST | `/api/projects/:id/modules` | `protect + isAdmin` | Add module |
| PUT | `/api/projects/:id/modules/:moduleId` | `protect + isAdmin` | Update module |
| DELETE | `/api/projects/:id/modules/:moduleId` | `protect + isAdmin` | Delete module |
| POST | `/api/projects/:id/modules/:moduleId/tasks` | `protect + isAdmin` | Add task |
| PUT | `/api/projects/:id/modules/:moduleId/tasks/:taskId` | `protect + isAdmin` | Update task |
| DELETE | `/api/projects/:id/modules/:moduleId/tasks/:taskId` | `protect + isAdmin` | Delete task |
| PUT | `/api/projects/:id/modules/:moduleId/tasks/:taskId/complete` | `protect` | Employee completes own task |
| GET | `/api/assignments/my` | `protect` | Current employee assignment |
| GET | `/api/assignments/employee-status` | `protect + isAdmin` | Active assignment map |
| GET | `/api/assignments` | `protect + isAdmin` | All assignments |
| POST | `/api/assignments` | `protect + isAdmin` | Create assignment |
| PUT | `/api/assignments/:id/complete` | `protect + isAdmin` | Complete/release assignment |
| DELETE | `/api/assignments/:id` | `protect + isAdmin` | Delete assignment |
| GET | `/api/admin/dashboard` | `protect + isAdmin` | Dashboard totals, status counts, project progress |

### Client-side routes

| Route | Guard | Purpose |
| --- | --- | --- |
| `/login` | Public | Sign in |
| `/unauthorized` | Public | Access denied page |
| `/` | Redirect based on role | Route to dashboard |
| `/admin/dashboard` | `AdminRoute` | Executive dashboard |
| `/admin/employees` | `AdminRoute` | Employee management |
| `/admin/projects` | `AdminRoute` | Project and module/task management |
| `/admin/assignments` | `AdminRoute` | Assignment management |
| `/employee/dashboard` | `ProtectedRoute` | Employee task dashboard |

## Notes

- All ObjectId params are validated before model access and return HTTP 400 for malformed IDs.
- Passwords are excluded from employee query results and nested populated employee references.
- Employee and project list endpoints support `search`, `page`, and `limit` query parameters.
