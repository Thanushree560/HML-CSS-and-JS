require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/daily_calendar";

// ---------- Middleware ----------
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "cal.html"));
});

// ---------- MongoDB connection ----------
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// ---------- Schema & Model ----------
// dateKey uniquely identifies a calendar day, e.g. "2026-8-14" (year-month-day, month is 0-indexed to match the frontend)
const noteSchema = new mongoose.Schema(
  {
    dateKey: { type: String, required: true, unique: true, index: true },
    text: { type: String, default: "" },
  },
  { timestamps: true }
);

const Note = mongoose.model("Note", noteSchema);

// ---------- Routes ----------

// Get all notes (used to render dots/markers on days that have notes, and to populate the popup)
app.get("/api/notes", async (req, res) => {
  try {
    const notes = await Note.find({}, { dateKey: 1, text: 1, _id: 0 });
    // Return as a { dateKey: text } map, convenient for the frontend
    const map = {};
    notes.forEach((n) => (map[n.dateKey] = n.text));
    res.json(map);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

// Get a single note by dateKey
app.get("/api/notes/:dateKey", async (req, res) => {
  try {
    const note = await Note.findOne({ dateKey: req.params.dateKey });
    res.json({ dateKey: req.params.dateKey, text: note ? note.text : "" });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch note" });
  }
});

// Create or update a note (upsert)
app.post("/api/notes", async (req, res) => {
  try {
    const { dateKey, text } = req.body;
    if (!dateKey) {
      return res.status(400).json({ error: "dateKey is required" });
    }

    if (!text || !text.trim()) {
      // Treat saving an empty note as a delete, keeps the DB tidy
      await Note.deleteOne({ dateKey });
      return res.json({ dateKey, text: "", deleted: true });
    }

    const note = await Note.findOneAndUpdate(
      { dateKey },
      { text },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ dateKey: note.dateKey, text: note.text });
  } catch (err) {
    res.status(500).json({ error: "Failed to save note" });
  }
});

// Delete a note explicitly
app.delete("/api/notes/:dateKey", async (req, res) => {
  try {
    await Note.deleteOne({ dateKey: req.params.dateKey });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete note" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
