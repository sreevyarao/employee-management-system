# EMS Client

This is the React + Vite frontend for the Employee Management System.

## Setup

1. Open a terminal in this folder.
2. Install dependencies:
   ```bash
   npm install
   ```

## Run locally

```bash
npm run dev
```

The app runs on `http://localhost:5173` by default.

## Production build

```bash
npm run build
```

## Notes

- The client expects the backend at `http://localhost:5000`.
- Login is handled through the API cookie-based auth flow.
- Admin pages are protected by the route guards in `src/routes`.
