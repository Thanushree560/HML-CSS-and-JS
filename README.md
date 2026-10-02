# CineVerse — Movie Review & Rating System

A full-stack web app where users can browse movies, sign up, log in, and
leave star ratings + written reviews. Admins can add and remove movies.

Built with:
- **Backend:** Node.js + Express (REST API)
- **Database:** MongoDB (via Mongoose)
- **Frontend:** Plain HTML, CSS and JavaScript (no framework/build step)
- **Auth:** JWT tokens + bcrypt password hashing

---

## 1. Project structure

```
movie-review-app/
├── server.js              Express app entry point
├── db.js                  Connects to MongoDB and seeds sample data
├── package.json
├── .env                   MongoDB URI, JWT secret & port
├── models/
│   ├── User.js             Mongoose schema for users
│   ├── Movie.js             Mongoose schema for movies
│   └── Review.js            Mongoose schema for reviews
├── middleware/
│   └── auth.js            JWT verification + admin-only guard
├── routes/
│   ├── auth.js             /api/auth/register, /login, /me
│   ├── movies.js           /api/movies  (list, detail, create, update, delete)
│   └── reviews.js          /api/movies/:id/reviews, /api/reviews/:id
└── public/                 Frontend (served automatically by Express)
    ├── index.html
    ├── style.css
    └── app.js
```

## 2. Set up MongoDB (pick one)

**Option A — Install MongoDB locally**
Follow MongoDB's install guide for your OS: https://www.mongodb.com/docs/manual/administration/install-community/
Once installed, it typically runs at `mongodb://127.0.0.1:27017` automatically — no extra setup needed, that's already the default in `.env`.

**Option B — MongoDB Atlas (free cloud database, no local install)**
1. Create a free cluster at https://www.mongodb.com/cloud/atlas/register
2. In Atlas, click "Connect" → "Drivers" and copy the connection string
   (looks like `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/`)
3. Paste it into `.env` as `MONGODB_URI`, adding a database name at the end,
   e.g. `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/cineverse`
4. In Atlas, under Network Access, allow your current IP address (or
   0.0.0.0/0 for testing) so the app can connect.

## 3. How to run it

You need [Node.js](https://nodejs.org) installed (v18 or later recommended)
and a MongoDB connection ready (see step 2 above).

```bash
cd movie-review-app
npm install       # downloads Express, Mongoose, JWT, bcrypt, etc.
npm start         # connects to MongoDB and starts the server
```

Then open **http://localhost:3000** in your browser.

The first time it connects, `db.js` automatically seeds the database with
two accounts and six sample movies (only if the `users` collection is empty):

| Role  | Email                | Password |
|-------|----------------------|----------|
| Admin | admin@cineverse.com  | admin123 |
| User  | demo@cineverse.com   | demo123  |

You can also register your own account from the "Create account" tab.

To reset the app to a clean state, drop the `cineverse` database (e.g. in
MongoDB Compass, Atlas UI, or `mongosh` with `use cineverse` then
`db.dropDatabase()`) — it will be recreated and reseeded on the next
`npm start`.

## 4. Features

- **Browse & search** movies by title/director, filter by genre, sort by
  newest / highest rated / release year
- **Register / log in** with a hashed password and a JWT session token
- **Leave one review per movie** (1–5 stars + optional comment), and edit
  or delete your own review
- **Average rating** is computed live from all reviews for a movie
- **Admin accounts** can add new movies and delete movies (which also
  removes their reviews via a foreign-key cascade)
- Permission checks happen **server-side** (not just hidden buttons) —
  e.g. a non-admin token gets a `403` if it calls the "add movie" endpoint
  directly

## 5. Database schema (MongoDB collections)

```
users    { _id, name, email (unique), password_hash, role, created_at }
movies   { _id, title, genre, release_year, director, poster_url,
           description, created_at }
reviews  { _id, movie (ObjectId ref Movie), user (ObjectId ref User),
           rating, comment, created_at }
         unique compound index on (movie, user) -- one review per user per movie
```

Average ratings aren't stored — they're computed on the fly with a
MongoDB aggregation (`$lookup` + `$avg`) whenever the movie list or a
movie's detail page is requested. When a movie is deleted, its reviews
are deleted too (`Review.deleteMany`), since MongoDB has no built-in
cascading deletes like a relational database would.

## 6. API reference (for your report/demo)

| Method | Endpoint                     | Auth        | Description                    |
|--------|-------------------------------|-------------|---------------------------------|
| POST   | /api/auth/register            | —           | Create an account               |
| POST   | /api/auth/login                | —           | Log in, returns a JWT           |
| GET    | /api/auth/me                   | user        | Current user's profile          |
| GET    | /api/movies                    | —           | List movies (search/filter/sort)|
| GET    | /api/movies/genres              | —           | Distinct genre list             |
| GET    | /api/movies/:id                | —           | Movie detail + its reviews      |
| POST   | /api/movies                    | admin       | Add a movie                     |
| PUT    | /api/movies/:id                | admin       | Edit a movie                    |
| DELETE | /api/movies/:id                | admin       | Delete a movie                  |
| POST   | /api/movies/:id/reviews         | user        | Add a review (once per movie)   |
| PUT    | /api/reviews/:id                | owner       | Edit your review                |
| DELETE | /api/reviews/:id                | owner/admin | Delete a review                 |

## 7. Ideas for extending it (good for extra marks)

- Pagination on the movie grid
- Image upload for posters instead of pasting a URL
- "Helpful" votes on reviews
- Password reset via email
- Deploy it: e.g. Render/Railway/Vercel for the Node server, paired with
  a free MongoDB Atlas cluster for the database

---

Built as a demonstration full-stack project (Express + MongoDB + vanilla JS).
