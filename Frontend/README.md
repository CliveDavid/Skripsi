# SJM admin website

This folder contains the website used by SJM staff to manage products, distributors, orders, and invoices. It is built with Angular 13. Although this folder is called `Frontend`, it is the **admin website**. The customer website is in [`../SJM`](../SJM/README.md).

Start with the [main project guide](../README.md) if this is your first time opening the project. It explains how the two websites, backend, and PostgreSQL database work together.

## What you need before opening the website

- Node.js and npm, using a version compatible with this Angular 13 project. See the main guide for the local setup.
- The dependencies installed in this folder.
- The backend running at `http://localhost:3000`, with its database and tables set up. Follow the [backend guide](../Backend/README.md).

The admin page can load without the backend, but signing in and loading or saving records require it.

## Start the admin website

Open a terminal in the repository's root folder (`SKRIPSI Cloned`), then run:

```powershell
cd Frontend
npm ci
npm start -- --port 4200
```

`npm ci` installs the versions recorded in `package-lock.json`. Run it when setting up the project or after dependencies change; it is not required every time you start the website.

Keep this terminal open. Wait for Angular to finish compiling, then open:

**Admin sign-in: <http://localhost:4200/login>**

To stop this website, press **Ctrl+C** in its terminal. The backend and customer website run in their own terminals.

## Sign in or create your first admin account

1. Open the admin sign-in page above.
2. If an admin account already exists, enter its **username** and password. Admin sign-in uses a username; customer sign-in uses an email address.
3. For a new local installation, click **Sign Up?** underneath the sign-in button. This opens `/signup`.
4. Choose a username with at least 3 characters and a password with at least 6 characters, then confirm the password and submit the form.
5. Return to `/login` and sign in with the account you just created. Successful sign-in opens `/dashboard`.

There is no default admin username or password supplied by these instructions. Creating an account requires a working backend and database. Admin signup does not use email verification.

## Find your way around

After signing in, use the sidebar:

- **Dashboard** (`/dashboard`): view the overview and reporting controls.
- **Admin** (`/admin`): manage admin accounts.
- **Distributor** (`/distributor`): manage the customer accounts referred to as distributors in the code.
- **Products** (`/product`): manage the product catalog.
- **Orders** (`/order`): view and manage orders.
- **Invoice** (`/invoice`): view invoices and open their details.
- **Additional Settings** (`/additional-settings`): maintain company information, product types, box types, prices, and shipment methods.

These paths all belong to `http://localhost:4200`. For example, the product page is <http://localhost:4200/product>. Use the list pages to open forms or record details so the website has the selected record's information.

For an empty database, start by entering the reference data in **Additional Settings**, then create products and distributor accounts before trying to place orders. Starting the servers does not add sample products or orders.

To open the customer view, start the separate `SJM` application and visit <http://localhost:4201/>. An admin account and a distributor account are separate accounts.

## Connection settings

The backend address is defined by `BASE_URL` in [`src/app/constants.ts`](src/app/constants.ts), currently `http://localhost:3000`. If you change the backend port or host, update that value and the matching value in `SJM/src/app/constants.ts`.

Address selectors use the external service configured as `ADDR_URL` in the same file. They need internet access and a working response from that service.

Use the documented ports when running both websites: **4200 for admin** and **4201 for customers**. Both Angular projects otherwise default to port 4200. Separate ports also keep each website's browser sign-in storage separate.

## Common problems

- **Port 4200 is already in use:** check whether the admin website is already running. Start the customer website on port 4201 instead of accepting an unexpected replacement port.
- **Sign-in fails or lists do not load:** check the backend terminal and database connection. Confirm that `BASE_URL` matches the running backend.
- **A new installation shows database/table errors:** complete database initialization in the backend guide. Installing npm packages does not create database tables.
- **No products or orders appear:** an empty database has no catalog or business records until they are added.
- **You are sent back to sign-in:** sign in again. The website stores a login expiry time in the browser and also has an inactivity logout service.

## Commands for development

Run these commands from `Frontend`:

```powershell
npm run build
npm test
```

The build output is written to `dist/distributor-order-system`. `npm test` starts the configured Karma browser test runner. Production builds enforce size budgets in `angular.json` and may fail if the application exceeds them.

The route definitions are in [`src/app/app-routing.module.ts`](src/app/app-routing.module.ts). Shared backend calls and authentication are in `src/app/shared/services/`; the management pages are in `src/app/pages/`.
