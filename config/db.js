require("dotenv").config()

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI);
    console.log("✅ Connessione a MongoDB riuscita");
  } catch (err) {
    console.error("❌ Errore di connessione a MongoDB:", err);
    process.exit(1);
  }
};

module.exports = connectDB;

