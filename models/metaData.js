const mongoose = require("mongoose");

// SCHEMA
const metaDataSchema = new mongoose.Schema({
  nomeOggetto: String,
  dimensioneFile: Number,
  urlOggetto: String,
  formatoFile: String,
  codiceCantiere: String,
  codiceLotto: String,
  codicePacchetto: String,
});

module.exports = mongoose.model("MetaData", metaDataSchema, "Metadata");
