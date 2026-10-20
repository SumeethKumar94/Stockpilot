# StockPilot — Inventory Management

A simple, modern inventory management app.

| Layer      | Technology                                   |
|------------|----------------------------------------------|
| Frontend   | Angular 18 (standalone components, signals), custom CSS with light/dark themes and 5 accent colours |
| Backend    | Node.js + Express REST API                   |
| Database   | PostgreSQL (`products` and `sales` tables)   |
| Testing    | Jest + Supertest (API), Karma + Jasmine (Angular), end-to-end sanity script |

## Features

- **Add products to inventory** — SKU, name, category, price and starting stock.
- **Edit / restock / delete products**, with live search by name, SKU or category.
- **Create sales** — pick a product and quantity; the sale is stored and **the product's stock is decreased automatically**.
- **Overselling is impossible** — the sale and the stock update run in one database transaction with a row lock; selling more than is in stock is rejected, even with simultaneous requests.
- **Dashboard** — product count, units in stock, inventory value, low-stock alerts, total and today's revenue, recent sales.
- **Modern UI** — light/dark mode and five accent colours (Indigo, Emerald, Rose, Amber, Sky), remembered between visits; responsive layout; toast notifications.

---

## Table of contents

1. [Project structure](#1-project-structure)
2. [Prerequisites](#2-prerequisites)
3. [Install PostgreSQL](#3-install-postgresql)
4. [Create the database](#4-create-the-database)
5. [Install and start the backend](#5-install-and-start-the-backend)
6. [Install and start the frontend](#6-install-and-start-the-frontend)
7. [Using the app](#7-using-the-app)
8. [Automated tests](#8-automated-tests)
9. [Sanity checks](#9-sanity-checks)
10. [Database schema](#10-database-schema)
11. [REST API reference](#11-rest-api-reference)
12. [Configuration](#12-configuration)
13. [Customising themes and currency](#13-customising-themes-and-currency)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Project structure

```
inventory-management/
├── README.md
├── docker-compose.yml          # optional: PostgreSQL in Docker
├── database/
│   ├── setup.sql               # creates the DB user + databases (run once, as superuser)
│   ├── schema.sql              # creates the tables (safe to re-run)
│   └── seed.sql                # sample products (safe to re-run)
├── backend/                    # Express API  (http://localhost:3000)
│   ├── .env.example            # copy to .env
│   ├── package.json
│   ├── src/                    # app.js, server.js, db.js, utils.js, routes/
│   ├── scripts/
│   │   ├── db.js               # db:init / db:seed / db:reset
│   │   └── sanity-check.js     # end-to-end sanity check
│   └── tests/api.test.js       # automated API tests
└── frontend/                   # Angular app  (http://localhost:4200)
    ├── package.json, angular.json, proxy.conf.json
    └── src/
        ├── styles.css          # global styles + themes
        └── app/                # pages/, services/ (+ *.spec.ts unit tests)
```

---

## 2. Prerequisites

| Tool        | Version              | Check with        |
|-------------|----------------------|-------------------|
| Node.js     | **20 LTS or newer** (18.19+ minimum) | `node -v` |
| npm         | 9 or newer (ships with Node) | `npm -v`  |
| PostgreSQL  | **14 or newer** (16 recommended) | `psql --version` |
| Google Chrome / Chromium | only needed for the Angular unit tests | — |

Install Node.js from <https://nodejs.org> (or with `nvm`: `nvm install 20`).

You do **not** need to install the Angular CLI globally; it is installed locally with the frontend dependencies and run through `npm` scripts.

---
2. Automated Coding Agent Setup and Execution

This section defines the required steps for an automated coding agent or CI pipeline to clone, configure, build, test, start, and validate the StockPilot Inventory Management System in an isolated Docker environment.

Important: Execute the steps in the order shown. The application uses Angular 18, Node.js + Express, and PostgreSQL 16. PostgreSQL must be available before database initialization, backend integration tests, or application startup.

2.1 Repository and working directory

The repository root contains README.md, database/, backend/, and frontend/.

For the automated environment, use the following working directory:

/workspace/repo

Verify the repository structure before continuing:

cd /workspace/repo

test -f README.md
test -f database/setup.sql
test -f database/schema.sql
test -f database/seed.sql
test -f backend/package.json
test -f frontend/package.json

echo "Repository structure verified"

If a required file is missing, stop and report the error rather than continuing with incomplete setup.

2.2 Create the application environment

The agent must create an isolated application environment and a separate PostgreSQL container.

Recommended configuration:

Setting

Value

Application image

node:20-bookworm

Database image

postgres:16

Repository directory

/workspace/repo

Docker network

Unique network per pipeline run

Database hostname

db

Database port

5432

Backend port

3000

Angular development server port

4200

Both containers must be connected to the same Docker network. The PostgreSQL container must be registered with the network alias db.

Networking requirement: The hostname db is only valid inside a container connected to the appropriate Docker network. Do not assume that db resolves from the host machine or from a container on another network.

The agent must verify that the database container is running and reachable before executing any database setup command.

2.3 Install operating system and application dependencies

Execute the following commands inside the application container:

apt-get update
apt-get install -y postgresql-client chromium

cd /workspace/repo/backend
npm install

cd /workspace/repo/frontend
npm install

These commands install the PostgreSQL client, Chromium for headless Angular tests, and the Node.js dependencies for both application layers.

If dependency installation fails, stop and report the complete command output. Do not mark the dependency stage as successful.

2.4 Configure environment variables

Create the backend environment file:

cd /workspace/repo/backend
cp .env.example .env

The backend requires the following configuration:

PORT=3000
DATABASE_URL=postgres://inventory_user:inventory_pass@db:5432/inventory_db
TEST_DATABASE_URL=postgres://inventory_user:inventory_pass@db:5432/inventory_test_db
LOW_STOCK_THRESHOLD=10

The database hostname db is appropriate for the automated Docker network. For a native local installation, use localhost instead.

The automated environment must ensure that the runtime configuration points to the correct database host. When environment variables are injected by the orchestrator, verify that they take precedence over any conflicting defaults in .env.

Never point TEST_DATABASE_URL at a database containing real application data. Automated backend tests may drop and recreate tables in the configured test database.

2.5 Start PostgreSQL and wait for readiness

Start the PostgreSQL container with the following database initialization settings:

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=postgres

Wait for PostgreSQL to accept connections before continuing. Run the readiness check inside the database container:

pg_isready -U postgres -h 127.0.0.1 -p 5432

The expected result indicates that the server is accepting connections.

Next, verify that the application container can resolve and reach PostgreSQL:

getent hosts db
pg_isready -U postgres -h db -p 5432

If getent is unavailable, use an equivalent DNS lookup utility.

Failure handling: If the hostname db cannot be resolved, stop the pipeline at this stage. Check the Docker network membership, database container status, and network alias. Do not continue to SQL setup or mark database initialization as successful.

2.6 Create the application databases and database user

Run the following command from the application container:

cd /workspace/repo

PGPASSWORD=postgres psql \
  -h db \
  -p 5432 \
  -U postgres \
  -d postgres \
  -v ON_ERROR_STOP=1 \
  -f database/setup.sql

The setup script creates the dedicated application user and the following databases:

inventory_db — application data.

inventory_test_db — automated integration testing.

The script must be compatible with the repository's documented initialization procedure. If it is not safe to execute more than once, the agent should execute it once against a fresh database instance rather than blindly retrying it.

2.7 Initialize database tables and sample data

After the databases have been created, initialize the application schema and seed the development data:

cd /workspace/repo/backend

npm run db:init
npm run db:seed

Expected results:

The products and sales tables are created.

The sample products are inserted.

The backend can connect using DATABASE_URL.

Verify that the database objects exist:

PGPASSWORD=inventory_pass psql \
  -h db \
  -U inventory_user \
  -d inventory_db \
  -c "\dt"

The output should include the products and sales tables.

2.8 Build the Angular frontend

Run the production build:

cd /workspace/repo/frontend
npm run build

The build must finish successfully and generate the production bundle under:

frontend/dist/inventory-ui/

A successful build verifies TypeScript compilation and Angular template compilation. It does not, by itself, prove that the backend or database is working.

2.9 Execute automated tests

Backend integration tests

cd /workspace/repo/backend
npm test

These tests require a working PostgreSQL connection and the configured inventory_test_db.

They validate API behaviour, product management, sales creation, stock reduction, input validation, and overselling protection.

Angular unit tests

cd /workspace/repo/frontend

export CHROME_BIN=/usr/bin/chromium
npm run test:ci

Run the tests in headless mode so that the process exits with an appropriate success or failure code.

On any test failure, retain the test output and report the failing suite and relevant error. Do not convert a failed test into a successful validation result.

2.10 Start the application

Start the backend and frontend as separate processes within the application container.

Backend terminal or managed process:

cd /workspace/repo/backend
npm start

Frontend terminal or managed process:

cd /workspace/repo/frontend
npm start -- --host 0.0.0.0

Both processes must remain running during the sanity-check stage.

Expected endpoints:

Component

URL

Backend health

http://127.0.0.1:3000/api/health

Angular application

http://127.0.0.1:4200/

The Angular development server must listen on 0.0.0.0 inside the container so that it can be reached through the container's published port or from other permitted containers.

2.11 Run automated sanity checks

Once the backend and frontend are running, execute:

cd /workspace/repo/backend
npm run sanity

Then verify the application endpoints:

curl --fail http://127.0.0.1:3000/api/health
curl --fail http://127.0.0.1:4200/

The automated sanity checks must confirm that:

The API health endpoint returns HTTP 200 and reports a database connection.

The Angular root page returns HTTP 200.

Product creation and validation work.

Creating a sale decreases product stock.

Overselling is rejected and does not decrease stock further.

Dashboard statistics can be retrieved.

If a configured health check fails, inspect the relevant process logs before retrying.

2.12 Required pipeline stage order

The automated coding agent should follow this sequence:

Clone the repository and check out the requested branch.

Verify the README and repository structure.

Create the isolated Docker network and application/database containers.

Install operating system and application dependencies.

Configure application environment variables.

Wait for PostgreSQL readiness and verify database network connectivity.

Create the application user and databases.

Initialize tables and seed sample data.

Build the Angular frontend.

Run backend integration tests.

Run Angular unit tests.

Start the backend and frontend.

Run API, UI, and business-rule sanity checks.

Collect logs and results, clean up the environment, and report the final verdict.

The pipeline must fail at the relevant stage if a mandatory command fails. It must not report an overall PASS unless all required checks succeed.

2.13 Troubleshooting automated execution

Error

Required action

could not translate host name "db"

Verify that both containers share a Docker network and PostgreSQL has the db network alias.

connection refused on port 5432

Check that PostgreSQL is running and ready before continuing.

database "inventory_db" does not exist

Execute the database setup script and verify the result.

Authentication failure

Compare the SQL setup credentials with the effective runtime environment variables.

Backend tests cannot connect

Verify TEST_DATABASE_URL and confirm that inventory_test_db exists.

Angular build fails

Preserve the compiler output and resolve the build errors before continuing.

Chrome/Karma fails

Verify Chromium installation and CHROME_BIN.

Health check fails

Check process logs, container port configuration, and the effective API/frontend startup commands.
## 3. Install PostgreSQL

Pick **one** option.

### Option A — Install natively

**macOS (Homebrew)**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Ubuntu / Debian**
```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo service postgresql start        # or: sudo systemctl start postgresql
```

**Windows**
1. Download the installer from <https://www.postgresql.org/download/windows/>.
2. Keep the default port **5432** and remember the password you set for the `postgres` user.
3. Make sure the *Command Line Tools* component is ticked so that `psql` is available (add `C:\Program Files\PostgreSQL\16\bin` to your `PATH` if `psql` is not found).

Verify PostgreSQL is running:
```bash
psql --version
pg_isready            # should print: accepting connections
```

### Option B — Docker (no local install)

From the project root:
```bash
docker compose up -d
```
This starts PostgreSQL 16 on port 5432 and **automatically runs `database/setup.sql`** the first time, so you can **skip step 4.1** and go straight to step 4.2. (The superuser is `postgres` / password `postgres`.)

---

## 4. Create the database

The app uses a dedicated database user and two databases:

| Name                | Purpose                                        |
|---------------------|------------------------------------------------|
| `inventory_user` (password `inventory_pass`) | database user used by the app |
| `inventory_db`      | the real application data                      |
| `inventory_test_db` | used **only** by automated tests (wiped on every test run) |

### 4.1 Create the user and databases (run once)

Run `database/setup.sql` as the PostgreSQL superuser. From the project root:

```bash
# Linux
sudo -u postgres psql -f database/setup.sql

# macOS (Homebrew – your own OS user is the superuser)
psql postgres -f database/setup.sql

# Windows (you will be asked for the postgres password)
psql -U postgres -f database/setup.sql
```

If you see `role "inventory_user" already exists` or `database ... already exists`, the step was done before — that is fine.

> Prefer a different password or names? Edit `database/setup.sql` **and** `backend/.env` (step 5.2) so they match.

### 4.2 Create the tables and load sample data

This is done from the backend folder **after** installing the backend dependencies — continue with step 5, which includes `npm run db:init` and `npm run db:seed`.

(If you prefer plain SQL instead, the equivalent is:
`psql -h localhost -U inventory_user -d inventory_db -f database/schema.sql` followed by `... -f database/seed.sql`.)

---

## 5. Install and start the backend

All commands in this section are run from the `backend/` folder:

```bash
cd backend
```

### 5.1 Install dependencies
```bash
npm install
```

### 5.2 Create your environment file
```bash
# macOS / Linux / Git Bash
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```
The defaults match `database/setup.sql`, so no edits are needed unless you changed the user, password, port or database names. See [Configuration](#12-configuration).

### 5.3 Create the tables and sample data
```bash
npm run db:init     # creates the products and sales tables
npm run db:seed     # inserts 8 sample products (optional but recommended)
```
Expected output:
```
Schema applied (tables: products, sales)
Sample products inserted
```
Both commands are safe to re-run. To wipe everything and start fresh: `npm run db:reset`.

### 5.4 Start the API
```bash
npm start           # or: npm run dev   (auto-restarts on file changes)
```
Expected output: `Inventory API running on http://localhost:3000  (health: /api/health)`

Quick check in another terminal:
```bash
curl http://localhost:3000/api/health
# {"status":"ok","database":"connected","time":"..."}
```
Leave this terminal running.

---

## 6. Install and start the frontend

Open a **second terminal**, from the project root:

```bash
cd frontend
npm install
npm start
```

Wait for `Application bundle generation complete`, then open **<http://localhost:4200>**.

The Angular dev server proxies every `/api/...` request to the backend on port 3000 (see `frontend/proxy.conf.json`), so no CORS setup is needed. **The backend must be running** or the pages will show an error banner.

Production build (optional): `npm run build` — output goes to `frontend/dist/inventory-ui/`.

---

## 7. Using the app

1. **Products → “+ Add product”** — enter SKU, name, category, price and initial quantity. The product appears in the table with a coloured stock badge (green = healthy, amber = low, red = out of stock).
2. **Products → “+ Stock”** adds units to an existing product; **Edit** changes details or corrects the stock count.
3. **Sales → “New sale”** — choose a product (only products in stock are listed), enter a quantity and optionally a customer name. The total is calculated live. Click **Record sale**.
4. The sale appears in the history and **the product's quantity is reduced** (check the Products page or the dashboard).
5. Trying to sell more than the available stock is blocked in the form, and also rejected by the API with a clear message.
6. **Dashboard** shows totals, low-stock alerts (stock ≤ `LOW_STOCK_THRESHOLD`, default 10) and recent sales.
7. Use the **Appearance** panel in the sidebar to switch light/dark mode and the accent colour.

Note: a product that already has sales cannot be deleted (the database protects your sales history).

---

## 8. Automated tests

### 8.1 Backend API tests (Jest + Supertest)

These are **integration tests against a real PostgreSQL database** (`inventory_test_db`). They cover product CRUD and validation, duplicate SKUs, restocking, search, the sale → stock-decrease rule, overselling rejection, **8 simultaneous sales never overselling**, delete protection and the stats endpoint.

> ⚠️ The tests **drop and recreate** the tables in the database named by `TEST_DATABASE_URL`. Never point it at real data. By default it is `inventory_test_db`, which exists only for this purpose.

Prerequisites: PostgreSQL running, step 4.1 done (so `inventory_test_db` exists), backend dependencies installed.

```bash
cd backend
npm test
```
Expected: all test suites pass (`Tests: ... passed`). If your credentials differ from the defaults, set `TEST_DATABASE_URL` in `backend/.env`.

### 8.2 Angular unit tests (Karma + Jasmine)

These test the API service (correct URLs, methods and payloads) and the theme service. They need Chrome or Chromium installed.

```bash
cd frontend
npm run test:ci          # one run in headless Chrome, then exits
npm test                 # watch mode with a visible browser window
```
If Karma cannot find Chrome, set the path first, e.g. `export CHROME_BIN=/usr/bin/chromium` (Windows PowerShell: `$env:CHROME_BIN="C:\Program Files\Google\Chrome\Application\chrome.exe"`).

### 8.3 Production build check (compiles every template)
```bash
cd frontend
npm run build
```
A successful build confirms the TypeScript and strict template type-checking pass.

---

## 9. Sanity checks

### 9.1 Automated sanity script (recommended)

With the backend **running** (step 5.4), in another terminal:

```bash
cd backend
npm run sanity
```

It checks, in order:

1. API health endpoint returns 200 and the database is connected
2. Creating a product works (201)
3. Duplicate SKU is rejected (409) and invalid input is rejected (400)
4. Creating a sale works and the total is correct
5. **Stock decreased from 10 to 7** after selling 3
6. Overselling is rejected (409) and stock is unchanged
7. The stats endpoint responds

Each line prints `PASS` or `FAIL`, the script exits with code 1 on any failure (usable in CI), and it **removes its own temporary records** afterwards. To check a deployed API instead: `API_URL=https://your-host npm run sanity`.

### 9.2 Manual checklist (UI)

| # | Action | Expected result |
|---|--------|-----------------|
| 1 | Open <http://localhost:4200> | Dashboard loads, no red error banner |
| 2 | Products page | 8 sample products listed (if you ran `db:seed`) |
| 3 | Add product `TEST-1`, price 10, quantity 5 | Success toast; product appears with stock 5 |
| 4 | Add `TEST-1` again | Error toast: SKU already exists |
| 5 | Sales → sell 2 × `TEST-1` | Success toast saying 3 left; sale appears in history |
| 6 | Products page | `TEST-1` now shows stock **3** |
| 7 | Sales → try to sell 4 × `TEST-1` | “Only 3 unit(s) available”, Record button disabled |
| 8 | Products → `+ Stock` 10 on `TEST-1` | Stock becomes 13 |
| 9 | Dashboard | Totals and recent sales updated |
| 10 | Toggle Dark mode, pick a colour, refresh the page | Theme is remembered |

### 9.3 Manual API checks with curl
```bash
# health
curl http://localhost:3000/api/health

# add a product
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"sku":"CURL-1","name":"Curl Test","category":"Test","price":15,"quantity":10}'

# sell 4 units (use the "id" returned above; assume 9)
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -d '{"product_id":9,"quantity":4,"customer_name":"Curl User"}'

# stock should now be 6
curl http://localhost:3000/api/products/9
```

### 9.4 Inspect the database directly
```bash
psql -h localhost -U inventory_user -d inventory_db
```
```sql
\dt                                   -- should list: products, sales
SELECT sku, name, quantity FROM products ORDER BY id;
SELECT * FROM sales ORDER BY id DESC LIMIT 5;
```
(Password: `inventory_pass`.)

---

## 10. Database schema

```
products                                   sales
─────────────────────────────              ──────────────────────────────────
id          SERIAL  PK                     id             SERIAL  PK
sku         VARCHAR(50)  UNIQUE NOT NULL   product_id     INTEGER NOT NULL → products.id (ON DELETE RESTRICT)
name        VARCHAR(150) NOT NULL          quantity       INTEGER NOT NULL  CHECK (> 0)
category    VARCHAR(80)  DEFAULT 'General' unit_price     NUMERIC(10,2)  -- price at time of sale
price       NUMERIC(10,2) CHECK (>= 0)     total_amount   NUMERIC(12,2)
quantity    INTEGER CHECK (>= 0)  -- stock customer_name  VARCHAR(120) (optional)
created_at / updated_at  TIMESTAMPTZ       created_at     TIMESTAMPTZ
```

Safety nets enforced by the database itself: stock can never go negative, SKUs are unique, and products with sales cannot be deleted.

**How a sale works** (`backend/src/routes/sales.js`), inside one transaction:
1. `SELECT ... FOR UPDATE` locks the product row.
2. If `quantity < requested` → rollback, HTTP 409.
3. `UPDATE products SET quantity = quantity - N`.
4. `INSERT INTO sales (...)` with the current unit price.
5. `COMMIT`.

---

## 11. REST API reference

Base URL: `http://localhost:3000/api`. Errors are returned as `{ "error": "message" }`.

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET    | `/health` | — | API + database status |
| GET    | `/products?search=term` | — | List products (optional search) |
| GET    | `/products/:id` | — | One product |
| POST   | `/products` | `{sku, name, category?, price, quantity?}` | Add product → 201 (409 if SKU exists) |
| PUT    | `/products/:id` | same as POST | Update product / correct stock |
| POST   | `/products/:id/restock` | `{quantity}` | Add stock |
| DELETE | `/products/:id` | — | Delete → 204 (409 if it has sales) |
| GET    | `/sales` | — | Latest 200 sales with product name |
| POST   | `/sales` | `{product_id, quantity, customer_name?}` | Create sale, decrease stock → 201 (409 if insufficient stock) |
| GET    | `/stats` | — | Dashboard numbers |

---

## 12. Configuration

`backend/.env` (copied from `.env.example`):

| Variable | Default | Meaning |
|----------|---------|---------|
| `PORT` | `3000` | API port (if you change it, also update `frontend/proxy.conf.json`) |
| `DATABASE_URL` | `postgres://inventory_user:inventory_pass@localhost:5432/inventory_db` | Main database |
| `TEST_DATABASE_URL` | `postgres://inventory_user:inventory_pass@localhost:5432/inventory_test_db` | Database wiped by `npm test` |
| `LOW_STOCK_THRESHOLD` | `10` | Stock level at or below which a product is “low stock” |

Connection string format: `postgres://USER:PASSWORD@HOST:PORT/DATABASE`.

---

## 13. Customising themes and currency

- **Colours & themes:** all colours are CSS variables at the top of `frontend/src/styles.css`. Edit the `[data-theme='light']` / `[data-theme='dark']` blocks, or add an accent by adding a `[data-accent='name']` block and an entry in `frontend/src/app/services/theme.service.ts`.
- **Currency:** change `CURRENCY_CODE` in `frontend/src/app/models.ts` (e.g. `'INR'`, `'EUR'`, `'GBP'`).

---

## 14. Troubleshooting

| Symptom | Cause / fix |
|---------|-------------|
| `psql: command not found` | PostgreSQL command-line tools are not on your `PATH`. Install them or add the `bin` folder (see step 3). |
| `ECONNREFUSED 127.0.0.1:5432` | PostgreSQL is not running. Start it (`brew services start postgresql@16`, `sudo service postgresql start`, or `docker compose up -d`). |
| `password authentication failed for user "inventory_user"` | `setup.sql` was not run, or the password in `backend/.env` differs from the one in `setup.sql`. |
| `database "inventory_db" does not exist` | Run step 4.1. |
| `permission denied for schema public` (PostgreSQL 15+) | The database must be owned by `inventory_user`. Re-create it with `setup.sql`, or run `ALTER DATABASE inventory_db OWNER TO inventory_user;` as superuser. |
| `Port 3000 is already in use` / `EADDRINUSE` | Another program uses it. Change `PORT` in `.env` **and** the target in `frontend/proxy.conf.json`. |
| Angular pages show “Is the API server running?” | Start the backend (step 5.4) and check `http://localhost:3000/api/health`. Restart `npm start` in the frontend if you edited `proxy.conf.json`. |
| `npm test` fails with connection errors | `inventory_test_db` is missing or `TEST_DATABASE_URL` is wrong (step 4.1). |
| Karma: `No binary for ChromeHeadless browser` | Install Chrome/Chromium or set `CHROME_BIN` (step 8.2). |
| `npm install` errors about Node version | Upgrade to Node 20 LTS. |
| Want to start over | `cd backend && npm run db:reset` |

---

## License

Free to use and modify for learning and internal projects.
