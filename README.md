# SIGED Academic Project

Academic teacher-test project exploring a SIGED-style education management system. It includes a Django REST backend and a React frontend for authentication and an initial protected application shell; it is not a client engagement or production deployment.

## Current Capabilities

- Custom-user authentication through Django REST Framework tokens.
- Login flow and protected routes in the React application.
- Initial authenticated layout and home page.
- Backend and frontend tests for the implemented authentication flow.
- Structured specifications and project-planning artifacts.

## Stack

- Django 4.2 and Django REST Framework
- React 19, TypeScript and Vite
- Tailwind CSS 4
- SQLite for local development
- pytest and Vitest

## Local Setup

### Backend

```bash
git clone https://github.com/AlejandroTatum/siged.git
cd siged/siged/backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

In a second terminal:

```bash
cd siged/siged/frontend
npm install
npm run dev
```

## Verification

```bash
cd siged/backend && pytest
cd ../frontend && npm test
```

## Status

Early academic implementation created for a teacher-assigned project. Authentication and the initial application shell are implemented; broader education-management workflows remain future work.
