# PixelMart

Production-grade e-commerce platform using **Java Spring Boot** microservices, **React**, and **MySQL**.

## Status

| Week | Focus | Progress |
|------|--------|----------|
| 1 | Foundation & browse | Week 1 complete |
| 2 | Cart, checkout, offers | Day 8 complete — Day 9 next (offers) |
| 3 | Wishlist, reviews, CI, ship | — |

See [docs/DAILY_TARGETS.md](docs/DAILY_TARGETS.md) for day-by-day goals.

## Tech stack

- **Backend:** Java 21, Spring Boot 3.4, Spring Cloud Gateway, Flyway, MySQL 8.4
- **Frontend:** React 19, Vite 6, Redux Toolkit, RTK Query, React Router 7
- **Deploy (v1):** Docker Compose

## Quick start

### Prerequisites

- Docker Desktop
- Node.js 20+
- JDK 21 + Maven 3.9+ (for local builds without Docker)

### 1. Environment

```bash
cp .env.example .env
```

### 2. Run backend (Docker)

```bash
docker compose up --build
```

Wait until MySQL is healthy and services are up.

| URL | Description |
|-----|-------------|
| http://localhost:8080/actuator/health | Gateway health |
| http://localhost:8080/api/auth/health | Auth via gateway |
| http://localhost:8080/api/catalog/health | Catalog via gateway |

### 3. Run frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — the dev server proxies `/api` to the gateway.

### 4. Build backend locally (optional)

```bash
# Windows / Linux / macOS (Maven Wrapper — no global Maven required)
./mvnw clean package -DskipTests

# Or with Maven installed
mvn clean package -DskipTests
```

## Project structure

```
pixelmart/
├── gateway/                 # API Gateway :8080
├── services/
│   ├── auth-service/        # :8081  schema: auth
│   ├── catalog-service/     # :8082  schema: catalog
│   ├── order-service/       # :8083  schema: orders
│   └── notification-service/# :8084  schema: notify
├── frontend/                # React SPA :5173
├── docker/                  # MySQL init scripts
└── docs/                    # Specs & daily targets
```

## Documentation

- [Master specification](docs/PIXELMART_MASTER_SPEC.md)
- [Daily targets (3 weeks)](docs/DAILY_TARGETS.md)
- [Architecture](docs/architecture.md)

## License

See [LICENSE](LICENSE).
