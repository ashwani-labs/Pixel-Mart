# Docker Setup

Run the full PixelMart stack from the **`pixelmart-setup`** folder.

## Prerequisites

| Requirement | Version / notes |
|-------------|-----------------|
| Docker Desktop or Docker Engine | 24+ recommended |
| Docker Compose | v2 (`docker compose`) |
| Disk space | ~2 GB for images + MySQL volume |
| Ports free | `3000`, `3307`, `8080`–`8084` |

Optional for local development without Docker images:

- **Java 21** — `mvn verify` / run services from IDE
- **Node.js 20** — `pixelmart-frontend` Vite dev server on `:5173`

## 1. Configure environment

Copy the template in this folder:

```bash
cd pixelmart-setup
cp .env.example .env
```

Edit `.env` and set at minimum:

- `JWT_SECRET` — long random string (32+ characters)
- `MYSQL_PASSWORD` / `MYSQL_ROOT_PASSWORD` — change for non-local use
- `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM` — only if you want real order emails

## 2. Start the stack

```bash
docker compose up --build
```

Detached mode:

```bash
docker compose up --build -d
```

Helper scripts (from repo root):

| OS | Command |
|----|---------|
| Windows | `.\scripts\start.ps1` (from `pixelmart-setup`) |
| Linux/macOS | `./scripts/start.sh` (from `pixelmart-setup`) |

First start builds images and may take several minutes. MySQL bootstrap SQL runs **once** when the `mysql_data` volume is new (see [SQL.md](SQL.md)).

## 3. Verify services

| URL | Service |
|-----|---------|
| http://localhost:3000 | React storefront (nginx) |
| http://localhost:8080/actuator/health | API gateway |
| http://localhost:8080/api/auth/health | Auth (via gateway) |
| http://localhost:8080/api/catalog/health | Catalog (via gateway) |
| http://localhost:8080/api/orders/health | Orders (via gateway) |
| http://localhost:8081/api/auth/health | Auth (direct) |
| http://localhost:8082/api/catalog/health | Catalog (direct) |
| http://localhost:8083/api/orders/health | Orders (direct) |
| http://localhost:8084/api/internal/health | Notification (direct) |

MySQL host port: **3307** (container internal port is 3306).

```bash
docker compose ps
```

All services should show `healthy` after `start_period`.

## 4. Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@pixelmart.local` | `Admin@123` |
| Customer | `customer@pixelmart.local` | `Customer@123` |

Demo coupon: `STYLE15`.

## 5. Stop and clean up

Stop without removing data:

```bash
docker compose down
```

Stop and **delete MySQL data** (re-runs all SQL init scripts on next start):

```bash
docker compose down -v
```

Windows helper: `.\scripts\reset-db.ps1` (from `pixelmart-setup`)

## 6. Compose services

| Compose name | Container | Port | Build context |
|--------------|-----------|------|---------------|
| `mysql` | pixelmart-mysql | 3307→3306 | `mysql:8.4` image |
| `auth-service` | pixelmart-auth | 8081 | `pixelmart-backend/auth-service/Dockerfile` |
| `catalog-service` | pixelmart-catalog | 8082 | `pixelmart-backend/catalog-service/Dockerfile` |
| `order-service` | pixelmart-order | 8083 | `pixelmart-backend/order-service/Dockerfile` |
| `notification-service` | pixelmart-notification | 8084 | `pixelmart-backend/notification-service/Dockerfile` |
| `api-gateway` | pixelmart-gateway | 8080 | `pixelmart-backend/gateway/Dockerfile` |
| `frontend` | pixelmart-frontend | 3000→80 | `pixelmart-frontend/Dockerfile` |

## 7. Frontend dev server (optional)

For hot reload instead of the Compose nginx build:

```bash
cd pixelmart-frontend
npm install
npm run dev
```

Open http://localhost:5173. Vite proxies `/api` to the gateway at `:8080`.

## 8. Troubleshooting

| Issue | Fix |
|-------|-----|
| Port already in use | Stop processes on `3000`, `3307`, `8080`–`8084`, or change ports in `docker-compose.yml` |
| MySQL unhealthy | Wait for `start_period` (30s); check `docker compose logs mysql` |
| Service restart loop / schema error | DB volume may be partial — `docker compose down -v` and start fresh |
| Frontend 502 / API errors | Ensure `api-gateway` is healthy; check `docker compose logs api-gateway` |
| Schema missing | Bootstrap SQL only runs on **empty** volume — see [SQL.md](SQL.md) |
| Hibernate DDL errors | Production uses `ddl-auto: none`; schema must come from `pixelmart-setup/sql/` |

## 9. Build backend without Compose

```bash
# From repo root (Java 21)
mvn -B verify
```

Integration tests use H2 with `ddl-auto: create-drop` in test profiles only — not used in Docker/runtime.
