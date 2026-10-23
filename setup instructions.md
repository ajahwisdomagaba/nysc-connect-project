# NYSC Connect (Unified Monorepo)

Centralized repository containing the Product Requirements (PRD), Backend API, and Frontend Application.

## Project Structure
- `/backend`: Node.js / Express REST API connected to MongoDB Atlas.
- `/frontend`: Client-side application.
- `/docs`: Product requirements documentation (PRD), API v1.1 specs, and architecture diagrams.

## Team Workflow
1. Never push directly to `main`.
2. Branch off `main` using the standard convention:
   - `feat/frontend-<feature-name>`
   - `feat/backend-<feature-name>`
   - `docs/<doc-name>`
3. Open a Pull Request targeting `main` for review.