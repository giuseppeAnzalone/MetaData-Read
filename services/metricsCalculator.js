const Metriche = require("../models/metriche");
const { extractCodesFromPath } = require("../utils/extractCodeUtils");

/**
 * Calcola e salva le metriche nel database.
 * @param {string} dirPath - Il percorso della directory.
 * @param {Array} fileList - Lista dei file con metadati.
 * dirPath: Percorso della directory. fileList: Lista dei file trovati nella directory.
 */
const metricsCalculator = async (dirPath, fileList) => {
    console.time(`📊 Calcolo metriche per ${dirPath}`);

    try {
        // Estrazione dei codici dalla directory (extractCodesFromPath)
        const codici = extractCodesFromPath(dirPath);

        // Se i codici non vengono trovati, stampa un errore e termina l’esecuzione
        if (!codici) {
            console.error("❗ Impossibile estrarre i codici completi dal percorso.");
            return;
        }

        // Costruzione dell’oggetto metricheData
        const metricheData = {
            ...codici,
            metriche: {
                numRisorse: fileList.length,
                dimTotale: fileList.reduce((acc, file) => acc + (file.dimensioneFile || 0), 0),
            },
            dettagliRisorse: calculateResourceDetails(fileList),
        };

        // Se esiste già una metrica per i codici specificati, la aggiorna. Se non esiste, la crea (upsert: true).
        await Metriche.updateOne(codici, { $set: metricheData }, { upsert: true });
        console.log(`✅ Metriche aggiornate per: ${dirPath}`);
    }
    
    catch (error) {
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

    // Inizializza un oggetto vuoto (groupedMetrics) per raggruppare i dati per formato
    const groupedMetrics = fileList.reduce((acc, { formatoFile, dimensioneFile }) => {
        if (!formatoFile) return acc;
        acc[formatoFile] = acc[formatoFile] || { numRisorse: 0, dimTotale: 0 };
        acc[formatoFile].numRisorse++;
        acc[formatoFile].dimTotale += dimensioneFile || 0;
        return acc;
    }, {});

    // Trasforma l’oggetto groupedMetrics in un array di risultati
    return Object.entries(groupedMetrics).map(([formatoFile, metriche]) => ({
        formatoFile,
        metriche,
    }));
};

module.exports = { metricsCalculator };
