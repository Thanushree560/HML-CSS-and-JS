# Expense Tracker Pro (with MongoDB backend)

Your expenses now save to a real database (MongoDB) instead of the browser's
localStorage, so data persists across devices/browsers and multiple people
could use it. You can also export everything to a CSV file that opens
directly in Excel.

## What changed

- Added an **Express** server (`server.js`) that serves the frontend and
  exposes an API at `/api/expenses`.
- Added a **Mongoose** model (`models/Expense.js`) and routes
  (`routes/expenses.js`) for creating, listing, and deleting expenses in
  MongoDB.
- Updated `public/script.js` to call that API with `fetch` instead of reading
  and writing `localStorage`.
- Added an **Export** button (top-right, CSV icon) that downloads all
  expenses as `expenses.csv`, which opens straight in Excel/Google Sheets.
- Income vs. expense is now tracked properly: anything with category
  "Salary" is treated as income, everything else as an expense, and Total
  Balance = Income − Expense.

## Folder structure

```
expense-tracker/
├── server.js
├── package.json
├── .env.example
├── models/
│   └── Expense.js
├── routes/
│   └── expenses.js
└── public/
    ├── index.html
    ├── style.css
    └── script.js
```

## 1. Install dependencies

```bash
cd expense-tracker
npm install
```

## 2. Set up MongoDB

You need a MongoDB connection string. Two easy options:

**Option A — MongoDB Atlas (free, no install, recommended)**
1. Go to https://www.mongodb.com/cloud/atlas/register and create a free
   account and a free (M0) cluster.
2. Under "Database Access", create a database user with a username/password.
3. Under "Network Access", allow access from your current IP (or `0.0.0.0/0`
   for testing).
4. Click "Connect" → "Drivers" and copy the connection string, e.g.:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/expense_tracker`

**Option B — Local MongoDB**
Install MongoDB Community Server (https://www.mongodb.com/try/download/community)
and run it locally. The default local URI is:
`mongodb://127.0.0.1:27017/expense_tracker`

## 3. Configure environment variables

Copy `.env.example` to `.env` and paste in your connection string:

```bash
cp .env.example .env
```

Then edit `.env` and set `MONGODB_URI` to whichever connection string you
picked above.

## 4. Run the app

```bash
npm start
```

You should see:
```
Connected to MongoDB
Server running on http://localhost:5000
```

Open **http://localhost:5000** in your browser — that's it. The old
`live-server`-only setup is no longer needed since Express now serves the
frontend files directly (from `public/`).

## API reference

| Method | Endpoint                     | Description                     |
|--------|-------------------------------|----------------------------------|
| GET    | `/api/expenses`               | List all expenses (newest first) |
| POST   | `/api/expenses`               | Add an expense `{ title, amount, category }` |
| DELETE | `/api/expenses/:id`           | Delete an expense by its Mongo `_id` |
| GET    | `/api/expenses/export/csv`    | Download all expenses as a CSV (opens in Excel) |

## Notes

- Deleting now uses MongoDB's `_id` field instead of a timestamp, so make
  sure you're running the updated `script.js` from `public/`.
- If you'd rather not deal with MongoDB at all right now, the CSV export
  route works off whatever's already in the database, and you can always
  re-import a CSV into Excel/Sheets for reporting.
