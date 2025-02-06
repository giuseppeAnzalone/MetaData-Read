const path = require("path");
const Metriche = require("../models/metriche");

/**
 * Estrae i codici dal percorso del file.
 */
const extractCodesFromPath = (filePath) => {
    const parts = filePath.split(path.sep);
    const indexCantiere = parts.findIndex(part => part.startsWith("CA"));
    if (indexCantiere === -1 || indexCantiere + 2 >= parts.length) return null;

    return {
        codiceCantiere: parts[indexCantiere],
        codiceLotto: parts[indexCantiere + 1],
        codicePacchetto: parts[indexCantiere + 2],
    };
};

/**
 * Calcola e salva le metriche nel database.
 */
const calcolaMetriche = async (dirPath, fileList) => {
    console.time(`📊 Calcolo metriche per ${dirPath}`);

    try {
        const codici = extractCodesFromPath(dirPath);
        if (!codici) {
            console.error("❗ Impossibile estrarre i codici dal percorso.");
            return;
        }

        const metricheData = {
            ...codici,
            metriche: {
                numRisorse: fileList.length,
                dimTotale: fileList.reduce((acc, file) => acc + file.dimensioneFile, 0),
            },
            dettagliRisorse: Object.entries(
                fileList.reduce((acc, { formatoFile, dimensioneFile }) => {
                    acc[formatoFile] = acc[formatoFile] || { numRisorse: 0, dimTotale: 0 };
                    acc[formatoFile].numRisorse++;
                    acc[formatoFile].dimTotale += dimensioneFile;
                    return acc;
                }, {})
            ).map(([formatoFile, metriche]) => ({ formatoFile, metriche })),
        };

        await Metriche.updateOne(codici, { $set: metricheData }, { upsert: true });
        console.log(`✅ Metriche aggiornate per: ${dirPath}`);
    } catch (error) {
        console.error("⚠️ Errore nel calcolo delle metriche:", error);
    }

    console.timeEnd(`📊 Calcolo metriche per ${dirPath}`);
};

module.exports = calcolaMetriche;
