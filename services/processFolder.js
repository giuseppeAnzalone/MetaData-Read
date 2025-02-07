const {scanDirectory} = require('./fileScanner')
const {metricsCalculator} = require('./metricsCalculator')

/**
 * Esegue la scansione e il calcolo delle metriche per una cartella.
 */
const processFolder = async (dirPath) => {
    console.time(`⏳ Elaborazione di ${dirPath}`);
    
    try {
        console.log(`📂 Elaborazione avviata per: ${dirPath}`);

        // Chiama la funzione scanDirectory per ottenere un elenco di file presenti nella directory specificata, con i relativi metadati
        const fileList = await scanDirectory(dirPath);

        // Se la lista di file (fileList) contiene almeno un elemento chiama metricsCalculator, che calcola e salva le metriche basate sui file trovati
        if (fileList.length > 0) {
            await metricsCalculator(dirPath, fileList);
        } else {
            console.log(`🔄 Nessun file trovato in ${dirPath}, nessuna metrica da calcolare.`);
        }
    } catch (error) {
        console.error(`❗ Errore durante l'elaborazione di ${dirPath}:`, error.message);
    }

    console.timeEnd(`⏳ Elaborazione di ${dirPath}`);
};

module.exports = processFolder;
