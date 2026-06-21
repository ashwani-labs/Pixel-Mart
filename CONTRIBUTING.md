# Contributing to PixelMart

Thank you for your interest in contributing to PixelMart. This project is a portfolio-grade e-commerce monorepo; contributions that improve clarity, reliability, or developer experience are welcome.

## Before you start

1. Read the [README](README.md) and [local setup guide](pixelmart-setup/SETUP.md).
2. Check [open issues](https://github.com/ashwani-labs/pixelmart/issues) to avoid duplicate work.
3. For security issues, see [SECURITY.md](SECURITY.md) — do **not** open a public issue for vulnerabilities.

## Development setup

```bash
git clone https://github.com/ashwani-labs/pixelmart.git
cd pixelmart/pixelmart-setup
cp .env.example .env   # Windows: Copy-Item .env.example .env
docker compose up --build
```

For frontend hot reload:

```bash
cd pixelmart-frontend
npm install
npm run dev
```

## Validation

Run these before opening a pull request:

```bash
# Backend build + tests
mvn verify

# Frontend type-check + build
cd pixelmart-frontend && npm ci && npm run build

# Optional: frontend lint
cd pixelmart-frontend && npm run lint
```

CI runs `mvn verify` and `npm run build` on every push and pull request to `main`.

## Pull request workflow

1. Fork the repository and create a feature branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Keep changes focused — one logical change per PR when possible.
3. Match existing code style (Java: Google Java Format via Spotless; TypeScript: ESLint).
4. Update documentation if you change setup, env vars, or API behavior.
5. Open a PR against `main` with:
   - A clear summary of **what** changed and **why**
   - Steps to test your change locally
6. Ensure CI passes before requesting review.

## Code guidelines

- **Backend:** Java 21, Spring Boot 3.4, follow existing package and service boundaries.
- **Frontend:** React 19 + TypeScript; reuse existing RTK Query patterns and component styles.
- **SQL:** Add or update scripts under `pixelmart-setup/sql/` in order; keep seed data realistic.
- **Secrets:** Never commit `.env`, credentials, or real API keys. Use `.env.example` for new variables.

## Questions

Open a [GitHub issue](https://github.com/ashwani-labs/pixelmart/issues) for bugs, feature ideas, or setup help.
