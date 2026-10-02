// db.js
// Connects to MongoDB using Mongoose and seeds sample data on first run.
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Movie = require("./models/Movie");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cineverse";

async function connectDB() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(MONGODB_URI);
  console.log(`Connected to MongoDB -> ${MONGODB_URI}`);
  await seed();
}

async function seed() {
  const userCount = await User.countDocuments();

  if (userCount === 0) {
    await User.create([
      {
        name: "Admin",
        email: "admin@cineverse.com",
        password_hash: bcrypt.hashSync("admin123", 10),
        role: "admin",
      },
      {
        name: "Demo User",
        email: "demo@cineverse.com",
        password_hash: bcrypt.hashSync("demo123", 10),
        role: "user",
      },
    ]);

    console.log("Seeded default users:");
    console.log("  Admin -> admin@cineverse.com / admin123");
    console.log("  User  -> demo@cineverse.com / demo123");
  }

  const movieCount = await Movie.countDocuments();

  if (movieCount === 0) {
    const sampleMovies = [
      {
        title: "The Silent Horizon",
        genre: "Sci-Fi",
        release_year: 2022,
        director: "Elena Vasquez",
        poster_url: "https://picsum.photos/seed/silenthorizon/400/600",
        description:
          "A lone astronaut discovers a signal that challenges everything humanity believes about its place in the universe.",
      },
      {
        title: "Paper Lanterns",
        genre: "Drama",
        release_year: 2019,
        director: "Hiro Tanaka",
        poster_url: "https://picsum.photos/seed/paperlanterns/400/600",
        description:
          "Three generations of a family reunite for a festival that forces old wounds into the light.",
      },
      {
        title: "Midnight Circuit",
        genre: "Action",
        release_year: 2023,
        director: "Marcus Cole",
        poster_url: "https://picsum.photos/seed/midnightcircuit/400/600",
        description:
          "An underground street racer is pulled into a heist that spans three countries in one night.",
      },
      {
        title: "The Gardener's Apprentice",
        genre: "Fantasy",
        release_year: 2021,
        director: "Freya Lindqvist",
        poster_url: "https://picsum.photos/seed/gardenersapprentice/400/600",
        description:
          "A young apprentice learns that the enchanted garden she tends is the only thing holding back an ancient curse.",
      },
      {
        title: "Static & Noise",
        genre: "Thriller",
        release_year: 2020,
        director: "Priya Nair",
        poster_url: "https://picsum.photos/seed/staticnoise/400/600",
        description:
          "A radio host uncovers a decades-old conspiracy hidden in the archives of her own station.",
      },
      {
        title: "Comet Season",
        genre: "Comedy",
        release_year: 2024,
        director: "Diego Fuentes",
        poster_url: "https://picsum.photos/seed/cometseason/400/600",
        description:
          "A small town prepares for a once-in-a-lifetime comet viewing, and absolutely nothing goes as planned.",
      },
    ];

    await Movie.insertMany(sampleMovies);
    console.log(`Seeded ${sampleMovies.length} sample movies.`);
  }
}

module.exports = { connectDB };
