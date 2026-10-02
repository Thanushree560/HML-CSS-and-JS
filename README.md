# Premium Calculator with MongoDB History

Your calculator now saves every calculation to MongoDB and shows a history panel next to it.

## How it's wired together

A browser page can't talk to MongoDB directly — it needs a server in between. That's what `server.js` does:

```
calci.html (browser)  →  server.js (Express, port 3000)  →  MongoDB
```

## Files

- `calci.html` – the calculator UI + history panel
- `server.js` – Express API that saves/fetches history from MongoDB
- `package.json` – dependencies
- `.env` – your MongoDB connection string

## Setup

1. **Install Node.js** (v18+) if you don't have it: https://nodejs.org

2. **Get MongoDB running** — pick one:
   - **Local**: install MongoDB Community Server (https://www.mongodb.com/try/download/community), then just run it — the default `.env` already points at `mongodb://127.0.0.1:27017/calculator`.
   - **Cloud (MongoDB Atlas, free tier)**: create a cluster at https://www.mongodb.com/cloud/atlas, get your connection string, and paste it into `.env` as `MONGODB_URI`.

3. **Install dependencies:**
   ```bash
   cd calculator-app
   npm install
   ```

4. **Start the server:**
   ```bash
   npm start
   ```
   You should see:
   ```
   ✅ Connected to MongoDB: mongodb://127.0.0.1:27017/calculator
   🚀 Server running at http://localhost:3000
   ```

5. **Open the calculator:** go to `http://localhost:3000/calci.html` in your browser (not by double-clicking the file — it needs to be served by the Express server so it can reach the API).

## What's stored

Each time you press `=`, the expression and its result are saved to a `History` collection in MongoDB with a timestamp. The history panel:
- Loads past calculations when the page opens
- Refreshes after every new calculation
- Lets you click a past result to reuse it
- Has a "Clear all" button to wipe history

## API endpoints (if you want to extend it)

| Method | Endpoint            | Description                  |
|--------|---------------------|-------------------------------|
| GET    | `/api/history`       | Get last 100 calculations     |
| POST   | `/api/history`       | Save a new calculation        |
| DELETE | `/api/history/:id`   | Delete one entry              |
| DELETE | `/api/history`       | Clear all history              |
