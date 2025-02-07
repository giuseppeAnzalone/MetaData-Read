const fs = require('fs').promises;

const fileFormats = {
    JPEG:[0xFF, 0xD8, 0xFF],
    PNG: [0x89, 0x50, 0x4E, 0x47],
    PDF: [0x25, 0x50, 0x44, 0x46],
    GIF: [0x47, 0x49, 0x46, 0x38],
    'TIFF (Big-endian)': [0x4D, 0x4D, 0x00, 0x2A],
    'TIFF (Little-endian)': [0x49, 0x49, 0x2A, 0x00],
    XML: [0x3C, 0x3F, 0x78, 0x6D]
};


/** 
 * Funzione per ottenere il formato del file basato sui magic numbers
 */ 
const detectFileFormat = async (filePath) => {

    // Legge i primi 64 byte del file
    const magicNumber = await readMagicNumber(filePath, 64);
    
    // Se la lettura fallisce o il buffer è vuoto il formato è considerato Unknown
    if (magicNumber.length === 0) return 'Unknown';

    // Trova la corrispondenza del formato nel set predefinito fileFormats
    // Converte l'oggetto fileFormats in un array di coppie [nomeFormato, pattern] usando Object.entries
    // Usa find() per cercare la prima coppia in cui il pattern dei magic number corrisponde ai primi byte del magicNumber
    // magicNumber.slice(0, pattern.length) estrae i byte necessari e li confronta con Buffer.from(pattern)
    const format = Object.entries(fileFormats).find(([_, pattern]) =>
        magicNumber.slice(0, pattern.length).equals(Buffer.from(pattern))
    );

    // Restituisce il nome del formato se trova una corrispondenza
    if (format) return format[0];  // Restituisce il nome del formato (ad esempio 'JPEG')

    // Se il file contiene una stringa in formato UTF-8 che include <?xml e <!DOCTYPE html, il formato viene considerato HOCR
    if (magicNumber.toString('utf8').includes('<?xml') && magicNumber.toString('utf8').includes('<!DOCTYPE html')) {
        return 'HOCR';
    }

    return 'Unknown';
};


/**
 * Funzione per leggere i primi N byte di un file 
 */
const readMagicNumber = async (filePath, numBytes = 64) => {
    try {

        // Apre il file in modalità lettura (r) utilizzando fs.open
        const fileHandle = await fs.open(filePath, 'r');
        
        // Alloca un buffer della dimensione specificata (numBytes, 64 byte di default)
        const buffer = Buffer.alloc(numBytes);
        
        // Legge i byte dal file e li scrive nel buffer
        await fileHandle.read(buffer, 0, numBytes, 0);
        
        // Chiude il file e restituisce il buffer con i byte letti.
        await fileHandle.close();
        return buffer;
    
    } catch (error) {
        console.error(`⚠️ Errore durante la lettura del file ${filePath}: ${error.message}`);
        return Buffer.alloc(0);
    }
};

module.exports = {detectFileFormat};