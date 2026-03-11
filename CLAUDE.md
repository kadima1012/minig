# Project Rules

## Architecture
- Always follow Clean Architecture (domain/application/infrastructure/presentation layers)
- Never mix layers — domain must not depend on infrastructure or presentation
- All business logic lives in use-cases (application layer)
- Backend and frontend each have their own clean architecture structure

## Code Style
- All code, comments, and documentation must be in English
- Use TypeScript strict mode — no `any` types
- Use Zod for request validation on backend

## Monorepo
- Shared types go in packages/shared/
- Do NOT use npm workspaces (Windows symlink issues) — use --prefix instead
- Shared package is resolved via tsconfig paths and vite aliases

## Games
- Each game has its own folder under games/ (backend and frontend)
- Reuse common components (Timer, Score, Button) from components/common/
- Each game page must have a "Back to Home" button

## Git Commits
- Format: `<type>(<scope>): <short description>`
- Types: `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`
- Scope: game name or package (e.g. `quiz`, `rps`, `frontend`, `backend`, `shared`)
- Description: lowercase, imperative mood, max 72 chars (e.g. "add timer to quiz page")
- Body (optional): explain WHY, not what — separated by a blank line
- Examples:
  - `feat(quiz): add countdown timer with visual feedback`
  - `fix(backend): handle empty question list in quiz endpoint`
  - `refactor(shared): extract common game types`
  - `chore: update dependencies`
