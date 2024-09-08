# Backend for SJM

This project provides the backend server for the SJM system. It is built with Node.js, Express, Sequelize (for PostgreSQL), and includes session authentication for admin users.

## Prerequisites

Before you get started, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or later)
- [PostgreSQL](https://www.postgresql.org/) (v12 or later)
- npm (Node package manager, comes with Node.js)

## Setting up

1. Clone this repository or download it.
2. Navigate into the project directory.
3. Install the required dependencies:
```bash
   npm install
```
4. Set up your `.env` file in the root directory. Here's an example of what it should look like:
```bash
   DATABASE_NAME=SJM
   DATABASE_USER=postgres
   DATABASE_PASSWORD=password
   DATABASE_HOST=localhost
   DATABASE_DIALECT=postgres
   DATABASE_URL=postgres://postgres:password@localhost:5432/SJM
   SESSION_SECRET=your_secret_key

```
   Make sure to replace the values as per your PostgreSQL credentials and preferences. Generate a strong, random string for `SESSION SECRET`.

## Scripts

1. Running the Server
   To start the backend server:
```bash
   npm start
```
   This will start the server at http://localhost:3000 (or the port specified in your .env file).

2. Syncing Models with the Database
   If you need to synchronize the models with the database (e.g., during the initial setup or when you make changes to the schema), use:
```bash
   node sync.js
```
   This script will synchronize the database schema with the defined models, updating tables as needed.

   Note: Running `node sync.js` will update the schema, add any missing tables, or alter them as necessary based on the Sequelize models.

