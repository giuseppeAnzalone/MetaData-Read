const express = require("express");
const connectDB = require("./config/db");
const metaDataRoutes = require("./routes/metaDataRoutes");

const app = express();
const PORT = 3002;

// Connessione al database
connectDB();

app.use(express.json());

// Rotte
app.use("/", metaDataRoutes);

// Avvio del server
app.listen(PORT, () => {
    console.log(`🚀 Server in ascolto su http://localhost:${PORT}/`);
});
