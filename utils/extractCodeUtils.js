const path = require("path");

const extractCodesFromPath = (filePath) => {
    const parts = filePath.split(path.sep);
    const indexCantiere = parts.findIndex(part => part.startsWith("CA"));

    return {
        codiceCantiere: parts[indexCantiere] || null,
        codiceLotto: parts[indexCantiere + 1] || null,
        codicePacchetto: parts[indexCantiere + 2] || null,
    };
};

module.exports = { extractCodesFromPath };

