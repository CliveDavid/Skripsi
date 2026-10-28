# SJM customer website

This folder contains the SJM website for customers who browse products and place orders. Customers are called **distributors** in the backend and admin website. This application is built with Angular 18.

The staff/admin website is a separate application in [`../Frontend`](../Frontend/README.md). Start with the [main project guide](../README.md) for the complete setup, including the backend and database.

## What you need before opening the website

- Node.js and npm, using a version compatible with this Angular 18 project. See the main guide for the local setup.
- The dependencies installed in this folder.
- The backend running at `http://localhost:3000`, with its PostgreSQL database and tables set up. Follow the [backend guide](../Backend/README.md).
- Products, box types, prices, and shipment methods entered through the admin website to try a complete order.

Customer registration also needs the backend's email service to send a verification code. The address dropdowns use an external Indonesian address service and need internet access.

## Start the customer website

Open a terminal in the repository's root folder (`SKRIPSI Cloned`), then run:

```powershell
cd SJM
npm ci
npm start -- --port 4201
```

`npm ci` installs the versions recorded in `package-lock.json`. Run it for the initial setup or after dependencies change; it is not required for every start.

Keep this terminal open. Wait for Angular to finish compiling, then open:

**Customer home: <http://localhost:4201/>**

**Customer sign-in: <http://localhost:4201/login>**

To stop this website, press **Ctrl+C** in its terminal. Run the backend and admin website in separate terminals.

The port argument matters: both Angular projects default to 4200. This guide reserves **4200 for admin** and **4201 for customers**, allowing both websites to run at the same time with separate browser sign-in storage.

## Create a customer account and sign in

1. Open <http://localhost:4201/register>, or click **Register** in the website header.
2. Enter your name, email address, and password, and accept the terms. The form requires a password of at least 8 characters containing letters, numbers, and a supported symbol.
3. Continue to the address step. Complete the address dropdowns, address details, and Indonesian phone number, then submit.
4. Check your email for the six-digit **OTP** (one-time verification code). Registration opens the verification page for your email address.
5. Enter the code before it expires. The backend gives codes a 15-minute lifetime. Use **Resend** on the verification page if necessary.
6. After verification, sign in at <http://localhost:4201/login> using your **email address** and password.

Verification activates the account; this self-registration flow does not include a separate admin approval step. A distributor account that has been deactivated cannot sign in.

There are no default customer credentials supplied by these instructions. An admin login from port 4200 cannot be used here. If staff created your distributor account, ask them for that account's email and temporary password instead.

## Find your way around

- **Home** (`/`): browse the catalog, search, and filter by product type.
- **My Cart** (`/cart`): review quantities, delivery address, delivery notes, and shipment method, then place an order. Checkout requires sign-in.
- **Orders** (`/order-history`): view your previous orders. Select an order to open its details.
- **Profile** (`/edit-profile`): update your account and address information.
- **Contact** (`/support-form`): open the customer support form.

All paths above belong to `http://localhost:4201`. Orders and profile pages require sign-in. After checkout, the website opens `/post-checkout/<order-number>` automatically; order details use `/order-details/<order-number>`. Open these through the website with an actual order number.

For a first trial, sign in, select a product and box type, add it to **My Cart**, choose a shipment method, and check the delivery address. The current cart requires the total quantity to meet the selected shipment method's configured capacity before checkout is enabled.

## Connection settings

The backend address is defined by `BASE_URL` in [`src/app/constants.ts`](src/app/constants.ts), currently `http://localhost:3000`. Change it if you run the backend on a different port or host. The admin application has its own `BASE_URL` in `Frontend/src/app/constants.ts`.

The same file defines `ADDR_URL`, used for address dropdowns. Email configuration belongs to the backend, not this Angular application; see the [backend guide](../Backend/README.md).

## Common problems

- **Home loads but products are missing:** check that the backend is running and that products, types, and prices have been created in the admin website. Starting the app does not add sample data.
- **Registration address dropdowns are empty:** check internet access and the address service configured in `ADDR_URL`.
- **No verification email arrives:** check spam and the backend email configuration/logs. Opening the frontend alone does not provide an email service. If registration saved the account before email delivery failed, registering again may report that the email already exists; use the verification page with that email and resend after fixing email delivery.
- **An expired or missing code prevents sign-in:** finish email verification first. The verification page expects an `email` query parameter, for example `/verify-otp?email=your-address%40example.com`; use your own registered address.
- **Checkout says the order is invalid:** add items, choose a shipment method, and meet its configured quantity requirement. Complete the delivery address and sign in before submitting.
- **Orders or profile redirect to login:** sign in again; those pages require a current browser login.
- **Port 4201 is already in use:** check whether this website is already running before starting another instance.

## Commands for development

Run these commands from `SJM`:

```powershell
npm run build
npm test
```

Build output is written under `dist/sjm`. `npm test` starts the configured Karma browser test runner. Production builds enforce size budgets in `angular.json` and may fail if the application exceeds them.

The website routes are in [`src/app/app.routes.ts`](src/app/app.routes.ts), backend calls are in `src/app/services/`, and page components are in `src/app/pages/`.
