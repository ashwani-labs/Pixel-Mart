# PixelMart — Local Setup Guide

Complete guide from **git clone** → **database setup** → **run backend & frontend**.

---

## Prerequisites

Install these before you start:

| Tool | Version | Used for |
|------|---------|----------|
| **Git** | any recent | Clone the repo |
| **Docker Desktop** | latest | MySQL + full stack (recommended) |
| **Java JDK** | 21 | Backend (local dev without Docker) |
| **Maven** | 3.9+ | Backend build (`./mvnw` included) |
| **Node.js** | 20+ | Frontend dev server |
| **npm** | 10+ | Frontend dependencies |

---

## Step 1 — Clone the repository

```bash
git clone https://github.com/ashwani-labs/pixelmart.git
cd pixelmart
```

**Windows (PowerShell):**

```powershell
git clone https://github.com/ashwani-labs/pixelmart.git
cd pixelmart
```

### Project folders

| Folder | What it contains |
|--------|------------------|
| `pixelmart-backend/` | API gateway + 4 microservices (auth, catalog, order, notification) |
| `pixelmart-frontend/` | React storefront and admin UI |
| `pixelmart-setup/` | Docker Compose, SQL scripts, this guide |

---

## Step 2 — Configure environment

Copy the example env file. Docker Compose reads `.env` from **`pixelmart-setup/`** when you run commands there.

**Linux / macOS:**

```bash
cp .env.example pixelmart-setup/.env
```

**Windows (PowerShell):**

```powershell
Copy-Item .env.example pixelmart-setup\.env
```

Default values work for local development:

| Variable | Default | Notes |
|----------|---------|-------|
| `MYSQL_ROOT_PASSWORD` | `root` | MySQL root password |
| `MYSQL_DATABASE` | `pixelmart-db` | Bootstrap database name |
| `MYSQL_USER` | `root` | App DB user |
| `MYSQL_PASSWORD` | `root` | App DB password |
| `JWT_SECRET` | (see `.env.example`) | Must be long enough for JWT signing |

You only need to edit `.env` if you change passwords or add SMTP credentials for email.

---

## Step 3 — Database setup

PixelMart uses **one MySQL 8.4 instance** with **four service databases**:

```
auth      → auth-service
catalog   → catalog-service
orders    → order-service
notify    → notification-service
```

Schema SQL lives in **`pixelmart-setup/sql/`** (not inside backend services).

| File | What it does |
|------|----------------|
| `01-schemas.sql` | Creates databases and grants |
| `02-auth-service.sql` | Users, roles, refresh tokens, demo accounts |
| `03-catalog-service.sql` | Products, categories, offers, reviews, seed data |
| `04-order-service.sql` | Carts, addresses, orders, payments |
| `05-notification-service.sql` | Email outbox |

Scripts run in **alphabetical order** on first MySQL startup.

### Option A — Automatic (Docker) — recommended

When you start Docker Compose with a **new** MySQL volume, all SQL files run automatically. No manual steps.

```bash
cd pixelmart-setup
docker compose up --build
```

MySQL is exposed on host port **3307** (container `3306`).

**Reset database** (wipe data and re-run all SQL):

```bash
cd pixelmart-setup
docker compose down -v
docker compose up --build
```

> Init scripts only run when the `mysql_data` volume is empty. Use `down -v` to force a fresh init.

### Option B — Manual (local or cloud MySQL)

If you run MySQL yourself (not Docker init), execute every script in order:

```bash
cd pixelmart-setup
mysql -h localhost -P 3306 -u root -p < sql/01-schemas.sql
mysql -h localhost -P 3306 -u root -p < sql/02-auth-service.sql
mysql -h localhost -P 3306 -u root -p < sql/03-catalog-service.sql
mysql -h localhost -P 3306 -u root -p < sql/04-order-service.sql
mysql -h localhost -P 3306 -u root -p < sql/05-notification-service.sql
```

Use port **3307** if you only started MySQL via Docker Compose (`-P 3307`).

### Verify database

```bash
docker exec -it pixelmart-mysql mysql -u root -proot -e "SHOW DATABASES;"
docker exec -it pixelmart-mysql mysql -u root -proot -e "SELECT email FROM auth.users;"
```

You should see `admin@pixelmart.local` and `customer@pixelmart.local`.

### Demo accounts (seeded in `02-auth-service.sql`)

| Role | Email | Password | Sign in at |
|------|-------|----------|------------|
| Admin | `admin@pixelmart.local` | `Admin@123` | `/admin-login` |
| Customer | `customer@pixelmart.local` | `Customer@123` | `/login` |

Admin credentials are rejected on the customer `/login` page. Use `/admin-login` for store management.

Demo coupon: **`STYLE15`** (15% off fashion category). Also try **`GLOW12`** (12% off skin care).

Catalog seed (`03-catalog-service.sql`): **8 super categories**, **26 sub-categories**, **86 products** (plus 1 hidden draft), sample offers and reviews.

---

## Step 4 — Run backend and frontend

Choose **one** of the two workflows below.

---

### Option A — Everything with Docker (easiest)

Starts MySQL, all backend services, API gateway, and production-built frontend in one command.

```bash
cd pixelmart-setup
docker compose up --build
```

Wait until all containers are healthy (first run may take several minutes to build images).

| URL | Service |
|-----|---------|
| http://localhost:3000 | Frontend (storefront + admin) |
| http://localhost:8080/actuator/health | API gateway health |
| http://localhost:8081 | auth-service (direct) |
| http://localhost:8082 | catalog-service (direct) |
| http://localhost:8083 | order-service (direct) |
| http://localhost:8084 | notification-service (direct) |
| localhost:3307 | MySQL (host → container 3306) |

**Stop (keep database data):**

```bash
cd pixelmart-setup
docker compose down
```

---

### Option B — Dev mode (hot-reload frontend + local backend)

Use Docker **only for MySQL**, then run backend and frontend on your machine.

#### 4.1 Start MySQL only

```bash
cd pixelmart-setup
docker compose up mysql -d
```

Ensure DB is ready (first start runs SQL init scripts):

```bash
docker exec pixelmart-mysql mysqladmin ping -h localhost -u root -proot
```

#### 4.2 Run backend services

From the **repo root**, with Java 21 and `JAVA_HOME` set:

```bash
# Build once (optional)
./mvnw -q -DskipTests package
```

Start each service in a **separate terminal** (or use your IDE). Point at Docker MySQL on port **3307**:

**Linux / macOS:**

```bash
export MYSQL_HOST=localhost
export MYSQL_PORT=3307
export MYSQL_USER=root
export MYSQL_PASSWORD=root
export JWT_SECRET=pixelmart-dev-secret-key-min-32-chars-long!!

./mvnw -pl pixelmart-backend/gateway spring-boot:run
./mvnw -pl pixelmart-backend/auth-service spring-boot:run
./mvnw -pl pixelmart-backend/catalog-service spring-boot:run
./mvnw -pl pixelmart-backend/order-service spring-boot:run
./mvnw -pl pixelmart-backend/notification-service spring-boot:run
```

**Windows (PowerShell):**

```powershell
$env:MYSQL_HOST = "localhost"
$env:MYSQL_PORT = "3307"
$env:MYSQL_USER = "root"
$env:MYSQL_PASSWORD = "root"
$env:JWT_SECRET = "pixelmart-dev-secret-key-min-32-chars-long!!"

.\mvnw.cmd -pl pixelmart-backend/gateway spring-boot:run
.\mvnw.cmd -pl pixelmart-backend/auth-service spring-boot:run
.\mvnw.cmd -pl pixelmart-backend/catalog-service spring-boot:run
.\mvnw.cmd -pl pixelmart-backend/order-service spring-boot:run
.\mvnw.cmd -pl pixelmart-backend/notification-service spring-boot:run
```

Start **gateway last** (after the four services are up).

Check gateway: http://localhost:8080/actuator/health

#### 4.3 Run frontend (Vite dev server)

```bash
cd pixelmart-frontend
npm install
npm run dev
```

Open **http://localhost:5173**. Vite proxies `/api` to the gateway at `http://localhost:8080`.

---

## Step 5 — Quick smoke test

1. Open http://localhost:3000 (Docker) or http://localhost:5173 (dev mode).
2. Confirm http://localhost:8080/actuator/health returns `UP`.
3. Browse products on the storefront.
4. Log in as `customer@pixelmart.local` / `Customer@123`.
5. Log in as `admin@pixelmart.local` / `Admin@123` and open `/admin`.

---

## Ports reference

| Port | Service |
|------|---------|
| 3000 | Frontend (Docker / nginx) |
| 5173 | Frontend (Vite dev) |
| 3307 | MySQL (host, Docker) |
| 8080 | API gateway |
| 8081 | auth-service |
| 8082 | catalog-service |
| 8083 | order-service |
| 8084 | notification-service |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Port already in use | Stop processes on 3000, 3307, 5173, 8080–8084 |
| MySQL tables missing | Volume may be stale — `docker compose down -v` then `up --build` |
| `JAVA_HOME` invalid | Point to JDK 21 |
| Frontend API errors | Ensure gateway is up at :8080 |
| Login fails after DB reset | Use seeded accounts above; passwords are in SQL |
| Init SQL did not run | Scripts run only on **empty** `mysql_data` volume |

---

## Build & test (CI parity)

From repo root:

```bash
./mvnw verify
cd pixelmart-frontend && npm ci && npm run build
```

---

## Architecture (short)

```
Browser → Frontend (:3000 or :5173)
              ↓ /api
         API Gateway (:8080)
              ↓
    auth | catalog | order | notification
              ↓
         MySQL 8.4 (auth, catalog, orders, notify)
```

Backend services use `ddl-auto: none`. All table DDL is in `pixelmart-setup/sql/`.
