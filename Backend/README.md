# SJM backend: the API and database connection

This server connects both SJM websites to PostgreSQL. It stores accounts, products, orders and invoices; sends verification emails; and generates invoice/report PDFs. It uses Node.js, Express and Sequelize.

Start with the [main setup guide](../README.md) if this is your first time using the project. There are three separate programs:

- `Backend`: the API at **http://localhost:3000**.
- `Frontend`: the administrator website at **http://localhost:4200/login**.
- `SJM`: the customer/distributor website at **http://localhost:4201/** when started with `--port 4201`.

Port 3000 does not serve either website. Its interactive API documentation is at **http://localhost:3000/swagger**.

## 1. Install dependencies and configure the server

You need Node.js, npm and a running PostgreSQL server. See the [main guide](../README.md) for runtime requirements. From the repository root:

```powershell
cd Backend
npm ci
```

If PowerShell blocks `npm.ps1`, use `npm.cmd` instead of `npm`. Installation needs internet access, including a browser download used by Puppeteer for PDFs.

If `Backend/.env` already exists, edit it rather than overwriting it. Otherwise:

```powershell
Copy-Item .env.example .env
```

Replace the placeholders in `.env` with your local settings:

```dotenv
PORT=3000
DATABASE_NAME=SJM
DATABASE_USER=postgres
DATABASE_PASSWORD=replace-with-your-local-database-password
DATABASE_HOST=localhost
DATABASE_DIALECT=postgres
ADMIN_SESSION_SECRET=replace-with-a-long-random-admin-secret
DISTRIBUTOR_SESSION_SECRET=replace-with-a-different-long-random-secret
EMAIL_USER=your-sender@gmail.com
EMAIL_PASS=replace-with-your-mail-app-password
SUPPORT_EMAIL=your-support@example.com
```

- The five `DATABASE_*` values identify your PostgreSQL database, login, host and database type. `DATABASE_DIALECT` must be `postgres` for this project.
- `PORT` is the API port. Both websites currently call `http://localhost:3000`; keep this value unless you also update their API URL constants.
- `ADMIN_SESSION_SECRET` and `DISTRIBUTOR_SESSION_SECRET` are separate login session secrets. For each value, generate a random string with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
- `EMAIL_USER` and `EMAIL_PASS` are the sender's email credentials. `SUPPORT_EMAIL` receives customer support messages.

The current database configuration does **not** read `DATABASE_URL` or `DATABASE_PORT`. PostgreSQL must be reachable on the default port, **5432**. The old `SESSION_SECRET` setting is also unused; set both role-specific secrets above.

Keep real credentials in the local `.env` file, which is ignored by Git. The example contains placeholders only.

## 2. Connect to PostgreSQL and create missing tables

If you already have a populated SJM database, use its connection settings and skip creating another database. For a new local database, open PostgreSQL's SQL Shell (`psql`) or pgAdmin and run:

```sql
CREATE DATABASE "SJM";
```

Use `DATABASE_NAME=SJM` to match this case-sensitive quoted name. The PostgreSQL account in `.env` needs permission to create tables in that database.

From the `Backend` folder, check connectivity:

```powershell
node test-db.js
```

Look for `Connection has been established successfully.` If the command remains open after its result, press **Ctrl+C**.

The normal server startup only checks the connection; it does not create application or session tables. To create missing tables, run from `Backend`:

```powershell
npm run setup:db
```

This runs `setup-db.js`, which orders application tables by their foreign-key dependencies and creates both login session tables. It uses plain Sequelize `sync()` without `force` or `alter`; existing table definitions are not altered. Existing schemas can still require manual review if they differ from the models. Running the command again checks for missing tables without clearing data.

The repository also includes `node sync.js`, which uses **`alter: true`** and can change existing table definitions. Its manual table order starts with a table referencing a distributor table, so it can fail on an empty database. Use `npm run setup:db` for first-time setup; back up existing data before any schema-altering work.

Neither setup method creates sample products, company information or default website accounts.

## 3. Start and stop the API

```powershell
npm start
```

Wait for:

```text
Database connection has been established successfully.
Server is running on http://localhost:3000
```

Keep the terminal running while using either website. Press **Ctrl+C** to stop it.

- `npm start`: regenerates `swagger-output.json`, then runs `app.js`.
- `npm run setup:db`: creates missing application and session tables without altering existing table definitions.
- `npm run dev`: runs Nodemon and restarts the backend after code changes. It does not regenerate Swagger.
- `node swagger.js`: regenerates the API documentation separately.
- `node test-db.js`: manually checks database connectivity.
- `npm test`: currently a placeholder that exits with an error; no backend automated test suite is configured.

## 4. Create accounts and open the websites

There are **no default login credentials or seeded accounts** in this repository.

### Administrator

Start the `Frontend` app using [its instructions](../Frontend/README.md). Open **http://localhost:4200/login** and click **Sign Up?** to create a local administrator, then return to sign-in with the username and password you chose. The link opens `/signup`; a first visit directly to that path can redirect back to login.

Administrator login uses a **username**. For API testing, `POST /admin/create` accepts `username`, `password` and optionally `is_active`; `POST /admin/login` accepts `username` and `password`.

### Customer/distributor

Start `SJM` on port 4201 using [its instructions](../SJM/README.md):

1. Open **http://localhost:4201/register** and enter your details.
2. Check your email for the six-digit one-time password (OTP).
3. Complete email verification within **15 minutes**.
4. Sign in at **http://localhost:4201/login** using your **email and password**.

Self-registration starts with an inactive account. Successful OTP verification activates it; there is no separate administrator approval step in this flow. Email delivery must work to complete normal registration.

For local testing without OTP email, use `POST /distributor/create-by-admin` through Swagger or an API client. It accepts `name`, `email` and `is_active`, and returns a generated `tempPassword`. Set `is_active` to `true` and save the response so you can sign in with that email/password and complete the address/profile. The current administrator creation form does not display the generated password; use the API response if you need those login credentials.

For a new database, use the administrator website to enter product types, box types, prices, shipment methods, products and company details before trying the full order/invoice workflow.

## Email and PDF requirements

`services/emailService.js` is configured for **smtp.gmail.com**, port **465**, with TLS. Changing `.env` alone does not change the SMTP host. Set working sender credentials in `EMAIL_USER` and `EMAIL_PASS`.

Email is used for registration OTPs, support requests, order processing messages and invoice attachments. The API can start without working email credentials, but those actions can fail. A failed registration email may leave an inactive account in the database; after fixing email configuration, use resend OTP instead of registering the same address again.

PDF generation uses Puppeteer and its downloaded Chrome browser. If it reports a missing browser, run from `Backend`:

```powershell
npx puppeteer browsers install chrome
```

Invoice PDFs also need company details, an order address, order items and a shipment method. Keep the API running so the renderer can load the company logo from `/public/images/SJM.png`.

## API navigation

Open **http://localhost:3000/swagger** after starting the server. Most data operations use **POST**, including reads such as `/product/get-all`; typing those paths into a browser sends GET and may return `Route not found`.

- `/admin`, `/distributor`: accounts and profile/address management.
- `/product`, `/productType`, `/boxType`, `/price`: catalogue and pricing.
- `/orders`, `/orderAddress`, `/shipmentMethods`: ordering and delivery.
- `/invoices`, `/dashboard`: invoicing, summaries and reports.
- `/company`, `/support`: company information and support messages.
- `/admin-notifications`, `/distributor-notifications`: notifications.

Swagger's generated host is `localhost:3000`. If changing the API port, update `swagger.js` and both websites' `src/app/constants.ts` files as well.

## Troubleshooting

- **Connection refused / `Unable to connect to the database`:** start PostgreSQL, check port 5432 and verify `.env`. The HTTP server only starts after a successful database connection.
- **Password authentication failed:** `DATABASE_PASSWORD` is your PostgreSQL account password, not a website password.
- **Database does not exist:** create it and check the exact name, including capitalization.
- **`relation ... does not exist`:** initialize missing application and session tables using step 2.
- **Session secret error during login:** set both role-specific session secrets, then restart the API.
- **`EADDRINUSE` on port 3000:** stop the earlier API process using that port.
- **Website network errors:** check that both frontend `src/app/constants.ts` files point to the running backend.
- **`http://localhost:3000/` returns `Route not found`:** expected; use `/swagger` for the API, port 4200 for administrators or port 4201 for customers.

## Where to find the code

- `app.js`: server setup, sessions and route mounting.
- `config/database.js`: PostgreSQL connection configuration.
- `setup-db.js`: initialization of missing application and session tables.
- `models/`: Sequelize table definitions and relationships.
- `routes/`: API operations.
- `services/emailService.js`: email configuration and sending.
- `utils/pdfGenerator.js`: invoice and report PDF generation.
