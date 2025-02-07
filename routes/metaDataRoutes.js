const express = require("express");
const path = require("path");

const processFolder = require("../services/processFolder");
const MetaData = require("../models/metaData");

const routes = express();


/** 
 * Endpoint per ottenere tutti i metadati
 */ 
routes.get("/", async (req, res) => {
  const metaData = await MetaData.find();
  res.status(200).json(metaData);
});


/**
 * Avvia l'intero processo (scansione + metriche)
 */
routes.post("/process", async (req, res) => {
  try {
      const { path: userPath } = req.body;
      if (!userPath) {
          return res.status(400).json({ error: "⚠️ Il campo 'path' è obbligatorio" });
      }

      const directoryPath = path.join(__dirname, "..", userPath);

      await processFolder(directoryPath);

      res.status(200).json({ message: `✅ Elaborazione completata per ${directoryPath}` });
  } catch (error) {
      console.error(`❗ Errore nell'elaborazione: ${error.message}`);
      res.status(500).json({ error: "Errore interno del server" });
  }
});



/**  
 * Endpoint per eliminare i metadati di un file specifico
*/
routes.delete("/delete-metadata", async (req, res) => {
  try {
    const { path: userPath } = req.body; // Prende il percorso dal body della richiesta

    if (!userPath) {
      return res.status(400).json({ error: "❌ Il campo 'path' è obbligatorio" });
    }

    const filePath = path.join(__dirname, "..", userPath); // Percorso assoluto
    console.log(`🗑 Eliminazione metadati per: ${filePath}`);

    // Controlla se i metadati esistono nel database
    const metaData = await MetaData.findOne({ urlOggetto: filePath });

    if (!metaData) {
      return res.status(404).json({ error: "❌ Metadati non trovati per questo file" });
    }

    // Elimina i metadati dal database
    await MetaData.deleteOne({ urlOggetto: filePath });

    res.status(200).json({ message: `✅ Metadati eliminati con successo per: ${filePath}` });
  } catch (error) {
    console.error(`❌ Errore durante l'eliminazione dei metadati: ${error.message}`);
    res.status(500).json({ error: "Errore interno del server" });
  }
});


/**  
 * Endpoint per eliminare tutti i metadati
 */
routes.delete("/clear", async (req, res) => {
  try {
    await MetaData.deleteMany(); // Elimina tutti i documenti nella collezione
    res.status(200).json({ message: "✅ Tutti i metadati sono stati eliminati." });
  } catch (error) {
    res.status(500).json({ message: `❌ Errore durante l'eliminazione dei metadati: ${error.message}` });
  }
});


module.exports = routes;
