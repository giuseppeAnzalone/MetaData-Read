const mongoose = require("mongoose");

// SCHEMA
const metricheSchema = new mongoose.Schema({
    codiceCantiere: String,
    codiceLotto: String,
    codicePacchetto: String,
    metriche: {
        numRisorse: Number,
        dimTotale: Number,
    },
    dettagliRisorse: [
        {
            formatoFile: String,
            metriche: {
                numRisorse: Number,
                dimTotale: Number,
            },
        },
    ],
});

module.exports = mongoose.model("Metriche", metricheSchema, "Metriche");
