const fs = require('fs').promises;
const path = require('path');

const { extractCodesFromPath } = require('./extractCodeUtils');
const {detectFileFormat} = require('./fileFormatUtils');


/**
 * Funzione per ottenere i metadati del file
 */
const getFileStats = async (filePath, fileName) => {
    try {

        // Ottieni le statistiche del file (fs.stat)
        const stats = await fs.stat(filePath); 

        // Rileva il formato del file (detectFileFormat)
        const formatoFile = await detectFileFormat(filePath);

        // Estrai i codici (extractCodesFromPath)
        const codes = extractCodesFromPath(filePath);
        
        // Ritorna un oggetto con tutti i metadati raccolti
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

        // Legge la directory (fs.readdir). L'opzione { withFileTypes: true } permette di distinguere tra file e directory
        const files = await fs.readdir(dirPath, { withFileTypes: true });

        //Elabora ciascun elemento della directory (map)
        const fileList = (await Promise.all(files.map(async (file) => {
            const filePath = path.join(dirPath, file.name);

            // Se è una directory (file.isDirectory()), richiama getFilesFromDirectory in modo ricorsivo
            if (file.isDirectory()) {
                return await getFilesFromDirectory(filePath);
            }
            // Se è un file, richiama getFileStats per ottenere i suoi metadati
            return await getFileStats(filePath, file.name);
        }))).flat().filter(Boolean);

        //Restituisci la lista dei file trovati
        return fileList;
        
    } catch (error) {
        console.warn(`⚠️ Errore nella lettura della directory ${dirPath}: ${error.message}`);
        return [];
    }
};

module.exports = { getFilesFromDirectory, getFileStats };
