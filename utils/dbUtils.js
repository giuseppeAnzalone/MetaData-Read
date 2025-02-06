const MetaData = require("../models/metaData");

/**
 * Trova file già esistenti nel database per evitare duplicati.
 */
const findExistingFiles = async (fileList) => {
    const existingFiles = await MetaData.find(
        { urlOggetto: { $in: fileList.map(f => f.urlOggetto) } },
        { urlOggetto: 1 }
    );
    return new Set(existingFiles.map(f => f.urlOggetto));
};

/**
 * Salva nuovi file nel database.
 */
const saveNewFiles = async (newFiles) => {
    await MetaData.insertMany(newFiles);
    console.log(`✅ Salvati ${newFiles.length} nuovi metadati.`);
};

module.exports = { findExistingFiles, saveNewFiles };
