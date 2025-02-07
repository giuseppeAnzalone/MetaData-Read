const fs = require('fs').promises;
const path = require('path');

const { extractCodesFromPath } = require('./extractCodeUtils');
const {detectFileFormat} = require('./fileFormatUtils');


// Funzione per ottenere i metadati del file
const getFileStats = async (filePath, fileName) => {
    try {
        const stats = await fs.stat(filePath);
        const formatoFile = await detectFileFormat(filePath);
        const codes = extractCodesFromPath(filePath);
        
        return {
            nomeOggetto: fileName,
            dimensioneFile: stats.size,
            urlOggetto: filePath,
            formatoFile: formatoFile,
            codiceCantiere: codes.codiceCantiere,
            codiceLotto: codes.codiceLotto,
            codicePacchetto: codes.codicePacchetto
        };
    } catch (error) {
        console.warn(`⚠️ Errore ottenendo i metadati di ${filePath}: ${error.message}`);
        return null;
    }
};

/**
 * Scansiona una directory in modo ricorsivo e restituisce una lista di file.
 */
const getFilesFromDirectory = async (dirPath) => {
    try {
        const files = await fs.readdir(dirPath, { withFileTypes: true });

        const fileList = (await Promise.all(files.map(async (file) => {
            const filePath = path.join(dirPath, file.name);

            if (file.isDirectory()) {
                return await getFilesFromDirectory(filePath); // Chiamata ricorsiva per le sottocartelle
            }

            return await getFileStats(filePath, file.name);
        }))).flat().filter(Boolean);

        return fileList;
    } catch (error) {
        console.warn(`⚠️ Errore nella lettura della directory ${dirPath}: ${error.message}`);
        return [];
    }
};

module.exports = { getFilesFromDirectory, getFileStats };
