# PixelMart Setup

Operations, Docker, SQL bootstrap, and environment templates.

This is one of **three main project folders**:

| Folder | Purpose |
|--------|---------|
| [`../pixelmart-backend`](../pixelmart-backend) | Spring Boot microservices + API gateway |
| [`../pixelmart-frontend`](../pixelmart-frontend) | React storefront and admin console |
| **`pixelmart-setup`** (this folder) | Docker Compose, SQL bootstrap, setup guides |

## Documents

| File | Description |
|------|-------------|
| [DOCKER.md](DOCKER.md) | Run the full stack with Docker Compose |
| [SQL.md](SQL.md) | Database bootstrap, Flyway, no `ddl-auto` |

## Folder layout

```
pixelmart-setup/
├── README.md
├── DOCKER.md
├── SQL.md
├── docker-compose.yml
├── .env.example
├── sql/
│   └── 01-schemas.sql
└── scripts/
```

## Quick start

From **this folder** (`pixelmart-setup`):

```bash
cp .env.example .env
docker compose up --build
```

Windows:

```powershell
.\scripts\start.ps1
```

Open **http://localhost:3000**. Gateway: **http://localhost:8080**.

## Database policy

- **No DDL auto** — services use `spring.jpa.hibernate.ddl-auto: none`
- **Flyway** applies migrations on service startup
- **`sql/01-schemas.sql`** only creates schemas and grants (no app tables)

See [SQL.md](SQL.md).
