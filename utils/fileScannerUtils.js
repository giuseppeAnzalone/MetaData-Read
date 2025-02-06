const fs = require('fs').promises;
const path = require('path');

// Funzione per ottenere il formato del file basato sui magic numbers
const detectFileFormat = async (filePath) => {
    const magicNumber = await readMagicNumber(filePath, 64); // Leggi i primi 16 byte

    console.log(`Magic Number per ${filePath}:`, magicNumber.toString('hex'));

    if (magicNumber.slice(0, 3).equals(Buffer.from([0xFF, 0xD8, 0xFF]))) {
        return 'JPEG';
    } else if (magicNumber.slice(0, 4).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47]))) {
        return 'PNG';
    } else if (magicNumber.slice(0, 4).equals(Buffer.from([0x25, 0x50, 0x44, 0x46]))) {
        return 'PDF';
    } else if (magicNumber.slice(0, 4).equals(Buffer.from([0x47, 0x49, 0x46, 0x38]))) {
        return 'GIF';
    } else if (
        magicNumber.slice(0, 4).equals(Buffer.from([0x4D, 0x4D, 0x00, 0x2A])) ||  // TIFF big-endian
        magicNumber.slice(0, 4).equals(Buffer.from([0x49, 0x49, 0x2A, 0x00]))    // TIFF little-endian
    ) {
        return 'TIFF';
    } else if (magicNumber.toString('utf8').includes('<?xml') &&  magicNumber.toString('utf8').includes('<!DOCTYPE html')) {
        return 'HOCR';

    } else if (magicNumber.slice(0, 4).equals(Buffer.from([0x3C, 0x3F, 0x78, 0x6D]))) {
        return 'XML';
    } else {
        return 'Unknown';
    }
};



// Funzione per leggere i primi N byte di un file
const readMagicNumber = async (filePath, numBytes = 64) => {
    try {
        const fileHandle = await fs.open(filePath, 'r');
        const buffer = Buffer.alloc(numBytes);
        await fileHandle.read(buffer, 0, numBytes, 0);
        await fileHandle.close();
        return buffer;
    } catch (error) {
        console.error(`⚠️ Errore durante la lettura del file ${filePath}: ${error.message}`);
        return Buffer.alloc(0);
    }
};

// Funzione per ottenere i metadati del file
const getFileStats = async (filePath, fileName) => {
    try {
        const stats = await fs.stat(filePath);
        const formatoFile = await detectFileFormat(filePath);

        return {
            nomeOggetto: fileName,
            dimensioneFile: stats.size,
            urlOggetto: filePath,
            formatoFile: formatoFile
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
                return await getFilesFromDirectory(filePath);
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
