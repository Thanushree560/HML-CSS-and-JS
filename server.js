require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const expenseRoutes = require("./routes/expenses");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/expense_tracker";

app.use(cors());
app.use(express.json());

// Serve the frontend (index.html, style.css, script.js) from /public
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.use("/api/expenses", expenseRoutes);

// Export all expenses as a downloadable CSV (opens fine in Excel)
app.get("/api/expenses/export/csv", async (req, res) => {
  try {
    const Expense = require("./models/Expense");
    const expenses = await Expense.find().sort({ createdAt: -1 });

    const header = "Title,Amount,Category,Type,Date\n";
    const rows = expenses
      .map((e) => {
        const date = new Date(e.createdAt).toLocaleString();
        const safeTitle = `"${e.title.replace(/"/g, '""')}"`;
        return `${safeTitle},${e.amount},${e.category},${e.type},"${date}"`;
      })
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=expenses.csv");
    res.send(header + rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to export expenses" });
  }
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
