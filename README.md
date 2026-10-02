# Daily Calendar (MongoDB-backed)

Your calendar now stores notes in MongoDB instead of the browser's `localStorage`.
Notes are shared across devices/browsers and persist even if you clear browser data.

## What changed

- **Before:** `localStorage.setItem(...)` / `getItem(...)` in the browser — notes only lived on one device, in one browser.
- **Now:** an Express server exposes a small REST API (`/api/notes`) backed by MongoDB via Mongoose. The frontend calls that API with `fetch()`.

## Project structure

```
calendar-app/
├── server.js          # Express server + MongoDB connection + API routes
├── package.json
├── .env.example        # copy to .env and fill in your MongoDB URI
└── public/
    └── cal.html         # the calendar UI, now talks to the API instead of localStorage
```

## Setup

1. **Install dependencies**
   ```bash
   cd calendar-app
   npm install
   ```

2. **Configure your MongoDB connection**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set `MONGODB_URI`:
   - Local MongoDB: `mongodb://127.0.0.1:27017/daily_calendar`
   - MongoDB Atlas (cloud, free tier available): `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/daily_calendar`

   If you don't have MongoDB installed locally, the easiest option is a free
   [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster — create one, add a database user,
   whitelist your IP (or `0.0.0.0/0` for testing), and copy the connection string it gives you.

3. **Run the server**
   ```bash
   npm start
   ```
   You should see:
   ```
   ✅ Connected to MongoDB
   🚀 Server running at http://localhost:3000
   ```

4. **Open the calendar**
   Visit `http://localhost:3000/cal.html` in your browser.

## API reference

| Method | Endpoint                | Description                                  |
|--------|--------------------------|-----------------------------------------------|
| GET    | `/api/notes`             | Get all notes as `{ dateKey: text }`          |
| GET    | `/api/notes/:dateKey`    | Get a single note                             |
| POST   | `/api/notes`             | Upsert a note — body: `{ dateKey, text }`     |
| DELETE | `/api/notes/:dateKey`    | Delete a note                                 |

`dateKey` format is `year-monthIndex-day`, e.g. `2026-8-14` for Sep 14, 2026 (month is 0-indexed, matching JavaScript's `Date`).

## Notes on the data model

Each note is stored as a MongoDB document:
```json
{
  "dateKey": "2026-8-14",
  "text": "Dentist appointment at 3pm",
  "createdAt": "...",
  "updatedAt": "..."
}
```
Saving an empty/blank note automatically deletes the document, so the collection only ever holds days that actually have notes. Days with a saved note now show a small red dot in the calendar grid.

## Deploying

If you want this reachable outside your machine, deploy `server.js` to any Node host (Render, Railway, Fly.io, a VPS, etc.), point `MONGODB_URI` at your Atlas cluster via that platform's environment variables, and serve/visit the deployed URL instead of `localhost`.
