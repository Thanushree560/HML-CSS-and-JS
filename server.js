// server.js
require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");

const { connectDB } = require("./db"); // connects to MongoDB & seeds sample data

const authRoutes = require("./routes/auth");
const movieRoutes = require("./routes/movies");
const reviewRoutes = require("./routes/reviews");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve the frontend (static files)
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api", reviewRoutes); // handles /api/movies/:id/reviews and /api/reviews/:id

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Fallback: any non-API route serves the SPA
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\nCineVerse server running at http://localhost:${PORT}\n`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    console.error("Check your MONGODB_URI in .env and make sure MongoDB is running.");
    process.exit(1);
  });
