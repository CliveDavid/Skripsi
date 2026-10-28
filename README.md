# SJM distributor ordering system

SJM is a thesis project for managing a product catalog, distributor orders, deliveries, and invoices. It has **two separate websites**: one for staff and one for customers. Customers are called **distributors** throughout the code and admin screens.

## Which folder should I use?

- **[`Frontend`](Frontend/README.md) is the admin website.** Staff use it to manage products, customer accounts, orders, invoices, and company settings. It uses Angular 13.
- **[`SJM`](SJM/README.md) is the customer website.** Distributors browse products, fill a cart, place orders, and check their order history. It uses Angular 18.
- **[`Backend`](Backend/README.md) is the shared API server.** Both websites send requests to it. It uses Node.js and Express to read and write a PostgreSQL database, send emails, and generate PDFs.

For the complete system, run all three programs and keep PostgreSQL running. Opening a website alone does not start the API or database. There is no `package.json` in the repository root; run npm commands inside the appropriate folder.

## Open the admin or customer website

Once the programs are running with the commands below:

- **Admin sign-in:** <http://localhost:4200/login>. Use an **admin username and password**.
- **Customer home/catalog:** <http://localhost:4201/>.
- **Customer sign-in:** <http://localhost:4201/login>. Use a **distributor email and password**.
- **Customer registration:** <http://localhost:4201/register>.
- **API documentation:** <http://localhost:3000/swagger>.

`localhost` means the computer running these programs. Port **4200** is for admin, **4201** is for customers, and **3000** is for the API. Going to `http://localhost:3000/` returns `Route not found`; that address is not a website home page.

## First-time setup

### 1. Check the required software

You need Node.js, npm (included with Node.js), and PostgreSQL. You also need the username and password for your local PostgreSQL installation. These are separate from website login details.

The local run for this checkout used **Node.js 20.15.1, npm 10.7.0, and PostgreSQL 16**. The websites use different generations of Angular; install their own locked dependencies rather than a global Angular CLI.

Check Node.js and npm in a terminal:

```powershell
node --version
npm --version
```

The commands in this guide work in PowerShell. If PowerShell blocks `npm.ps1`, replace `npm` with `npm.cmd`; changing the execution policy is unnecessary.

### 2. Install each program's dependencies

Open a terminal in the repository root, the folder containing `Backend`, `Frontend`, and `SJM`. Run:

```powershell
cd Backend
npm ci
cd ../Frontend
npm ci
cd ../SJM
npm ci
cd ..
```

`npm ci` downloads the package versions listed in each folder's `package-lock.json`. Installation needs internet access. The backend also downloads a Chrome browser for PDF generation. Install dependencies once, then repeat only when the lockfile changes or dependencies need reinstalling.

### 3. Configure the backend and database

1. Make sure the PostgreSQL service is running on port **5432**.
2. If you already have an SJM database and `Backend/.env`, use those settings. For a new database, open pgAdmin's Query Tool or PostgreSQL's SQL Shell and run `CREATE DATABASE "SJM";` while connected to an existing database such as `postgres`.
3. If `Backend/.env` does not exist, copy [`Backend/.env.example`](Backend/.env.example) to `Backend/.env`. Keep an existing `.env` and edit its settings instead of replacing it.
4. Set the database name, PostgreSQL username/password, and both session secrets in `.env`. Set email credentials if you want to test customer registration, support emails, or emailed invoices. The [backend guide](Backend/README.md) explains each setting.

From the repository root, create any missing tables:

```powershell
cd Backend
npm run setup:db
cd ..
```

This creates missing application tables and both login session tables. It does not clear records, alter existing table definitions, or create demo accounts/products. On an existing database, schema differences may need separate attention; this command is not a migration tool.

### 4. Start the three programs

Open **three separate terminals**, each starting in the repository root. Leave them open while using the application.

**Terminal 1 — shared backend:**

```powershell
cd Backend
npm start
```

Wait for `Database connection has been established successfully.` and `Server is running on http://localhost:3000`.

**Terminal 2 — admin website:**

```powershell
cd Frontend
npm start -- --port 4200
```

Wait for compilation to finish, then open <http://localhost:4200/login>.

**Terminal 3 — customer website:**

```powershell
cd SJM
npm start -- --port 4201
```

Wait for compilation to finish, then open <http://localhost:4201/>. The port argument matters: both websites default to 4200, so starting both without it causes a conflict.

## Get your first accounts

### Admin access

If this database already has an admin account, use its username and password. The repository does not supply default credentials.

For a new local installation, open <http://localhost:4200/login> and click **Sign Up?**. Choose your own username and password, then return to sign-in. Use the link from the login page because the app can redirect an unauthenticated first visit to `/signup` back to `/login`.

After sign-in, the sidebar provides **Dashboard**, **Admin**, **Distributor**, **Products**, **Orders**, **Invoice**, and **Additional Settings**.

### Customer/distributor access

Open <http://localhost:4201/register>, enter your account and address details, and complete the emailed six-digit OTP verification. OTP means one-time password; the code expires after **15 minutes**. Verification activates the account. Then sign in at <http://localhost:4201/login> using your email and chosen password.

An admin account cannot be used to sign in to the customer website. There is no default customer account either. Normal customer registration requires working backend email settings and internet access for the address dropdowns.

For local testing without email, the backend also supports an admin-created distributor: use Swagger's **POST `/distributor/create-by-admin`** with a name, email, and `is_active: true`, and save the returned `tempPassword`. That email and temporary password can sign in to the customer website. The current admin form does not display this returned password, so use the API response for this workflow. See the [backend account guide](Backend/README.md#customerdistributor).

## Try the project for the first time

1. Sign in to the admin website. In **Additional Settings**, enter company details, product types, box types, prices, and shipment methods. Add the types and box types before their prices.
2. Add active products in **Products**. A fresh database has no sample catalog.
3. Register and verify a customer account, or use an active distributor account that already exists.
4. Open the customer website, sign in, choose products and box types, and add them to **My Cart**.
5. Check the delivery address and select a shipment method. The cart enables checkout when the total quantity meets that method's configured capacity.
6. Place an order, then use **Orders** in the customer website and **Orders** / **Invoice** in the admin website to follow the workflow.

Email-dependent actions require valid sender credentials. PDF generation requires Puppeteer's browser and the relevant company/order data. Starting the servers does not configure these integrations or add business records.

## Stop, restart, and troubleshoot

Press **Ctrl+C** in each server terminal to stop that program. To run the project again, start PostgreSQL and repeat the three start commands; you do not need to reinstall packages or recreate accounts each time.

- **A port is already in use:** check the server terminals for an existing instance. Keep admin on 4200 and customers on 4201. Stop the earlier instance before starting a replacement.
- **The browser cannot reach a website:** check that its terminal is still running and compilation completed. Open the matching port from the access links above.
- **The page opens but data/login fails:** check the backend terminal and PostgreSQL. The two websites both use `http://localhost:3000`, configured in their `src/app/constants.ts` files.
- **Database password or connection errors:** review `Backend/.env`. `DATABASE_URL`, `DATABASE_PORT`, and the old `SESSION_SECRET` setting are not read by the current database/session configuration; follow the backend example instead.
- **Missing database tables:** run `npm run setup:db` inside `Backend`. Installing packages does not create tables.
- **No customer verification code:** check spam and the backend email configuration. Fix email delivery, then resend the OTP from the verification page.
- **Empty address selectors:** check internet access and the external address service configured as `ADDR_URL` in each website's `src/app/constants.ts`.
- **An API URL says `Route not found`:** many API operations require POST. Use Swagger to call them; opening a URL in the browser sends GET.

For component-specific commands, code locations, and troubleshooting, continue with the [backend guide](Backend/README.md), [admin guide](Frontend/README.md), or [customer guide](SJM/README.md).
