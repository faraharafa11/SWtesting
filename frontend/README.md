# SW Testing - Frontend (Beta)

This `frontend/` folder contains a simple Vite + React frontend for the Restaurant Reservation and Management System backend you already implemented.

Quick start

1. From this repo root, change into the frontend folder:

```powershell
cd "frontend"
```

2. Install dependencies:

```powershell
npm install
```

3. Start dev server:

```powershell
npm run dev
```

The frontend expects the backend to run on `http://localhost:5000/api`. You can override with environment variable `VITE_API_BASE`.

Testing

- Unit & integration tests are written with `vitest` and `@testing-library/react`:

```powershell
npm test
```

Notes on requirements coverage

- Programming paradigms: React components show declarative UI; the `useEffect` with fetch demonstrates imperative code for side-effects.
- Design patterns: `AuthContext` uses the Context + Reducer pattern (a variation of the Observer/State patterns). `services/api.js` centralizes backend access (Repository-like pattern).
- TDD: tests under `src/__tests__` show unit/integration tests that should be extended during development.
- Testing techniques: unit and integration tests provided; you can add E2E tests with Cypress if needed.
- Code quality: code is modular with separation of concerns (pages, components, services, context).
