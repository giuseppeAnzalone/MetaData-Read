const { getFilesFromDirectory } = require("../utils/fileScannerUtils");
const { findExistingFiles, saveNewFiles } = require("../utils/dbUtils");

/**
 * Scansiona una directory e salva i metadati dei file.
 * @param {string} dirPath - Percorso della directory da scansionare.
 * @returns {Array} - Lista di file elaborati.
 */

const scanDirectory = async (dirPath) => {
    console.time(`⏳ Scansione di ${dirPath}`);

    try {
        const fileList = await getFilesFromDirectory(dirPath);
        if (fileList.length === 0) {
            console.log(`📂 Nessun file trovato in ${dirPath}`);
            return [];
        }

        // Controllo duplicati nel database
        const existingFiles = await findExistingFiles(fileList);
        const newFiles = fileList.filter(file => !existingFiles.has(file.urlOggetto));

        if (newFiles.length > 0) {
            await saveNewFiles(newFiles);
        } else {
            console.log(`🔄 Nessun nuovo file da salvare.`);
        }

        return fileList;
    } catch (error) {
        console.error(`⚠️ Errore durante la scansione di ${dirPath}:`, error);
        return [];
    } finally {
        console.timeEnd(`⏳ Scansione di ${dirPath}`);
    }
};

module.exports = {scanDirectory};
