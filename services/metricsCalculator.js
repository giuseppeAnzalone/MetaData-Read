const Metriche = require("../models/metriche");
const { extractCodesFromPath } = require("../utils/extractCodeUtils");

/**
 * Calcola e salva le metriche nel database.
 * @param {string} dirPath - Il percorso della directory.
 * @param {Array} fileList - Lista dei file con metadati.
 */

const metricsCalculator = async (dirPath, fileList) => {
    console.time(`📊 Calcolo metriche per ${dirPath}`);

    try {
        const codici = extractCodesFromPath(dirPath);

        if (!codici) {
            console.error("❗ Impossibile estrarre i codici completi dal percorso.");
            return;
        }

        const metricheData = {
            ...codici,
            metriche: {
                numRisorse: fileList.length,
                dimTotale: fileList.reduce((acc, file) => acc + (file.dimensioneFile || 0), 0),
            },
            dettagliRisorse: calculateResourceDetails(fileList),
        };

        await Metriche.updateOne(codici, { $set: metricheData }, { upsert: true });
        console.log(`✅ Metriche aggiornate per: ${dirPath}`);
    } catch (error) {
        console.error("⚠️ Errore nel calcolo delle metriche:", error.message);
    }

    console.timeEnd(`📊 Calcolo metriche per ${dirPath}`);
};


/**
 * Calcola i dettagli delle risorse raggruppati per formato di file.
 * @param {Array} fileList - Lista dei file con metadati.
 * @returns {Array} - Dettagli delle risorse per ogni formato.
 */

const calculateResourceDetails = (fileList) => {
    const groupedMetrics = fileList.reduce((acc, { formatoFile, dimensioneFile }) => {
        if (!formatoFile) return acc;
        acc[formatoFile] = acc[formatoFile] || { numRisorse: 0, dimTotale: 0 };
        acc[formatoFile].numRisorse++;
        acc[formatoFile].dimTotale += dimensioneFile || 0;
        return acc;
    }, {});

    return Object.entries(groupedMetrics).map(([formatoFile, metriche]) => ({
        formatoFile,
        metriche,
    }));
};

module.exports = { metricsCalculator };
