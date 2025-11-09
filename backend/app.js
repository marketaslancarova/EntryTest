import fs from "node:fs/promises";

import bodyParser from "body-parser";
import express from "express";

const app = express();

app.use(express.static("images"));
app.use(bodyParser.json());

// CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // allow all domains
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  next();
});

// GET /tiles – načte pole tile objektů z ./data/tiles.json
app.get("/tiles", async (req, res) => {
  try {
    const fileContent = await fs.readFile("./data/tiles.json", "utf-8");
    const tilesData = JSON.parse(fileContent); // očekává se, že je to Array
    res.status(200).json({ tiles: tilesData });
  } catch (err) {
    console.error("Chyba při čtení tiles.json:", err);
    res.status(500).json({ message: "Chyba při čtení tiles" });
  }
});

// PUT /tiles – očekává { tiles: Tile[] } a celé to uloží do ./data/tiles.json
app.put("/tiles", async (req, res) => {
  try {
    const { tiles } = req.body;

    if (!Array.isArray(tiles)) {
      return res.status(400).json({ error: "Missing tiles array" });
    }

    // případně validace / doplnění id
    const cleanedTiles = tiles.map((t, index) => ({
      id: t.id || `${Date.now()}-${index}`,
      bg: t.bg || "#3366ff",
      text: t.text ?? "",
      link: t.link ?? "",
    }));

    // uložit do JSON souboru jako pole
    await fs.writeFile(
      "./data/tiles.json",
      JSON.stringify(cleanedTiles, null, 2),
      "utf-8"
    );

    console.log("✅ Uloženo:", cleanedTiles.length, "tiles");
    res.status(200).json({ tiles: cleanedTiles });
  } catch (err) {
    console.error("Chyba při ukládání tiles:", err);
    res.status(500).json({ message: "Chyba při ukládání tiles" });
  }
});

// DELETE /tiles/:id – smaže tile z ./data/tiles.json
app.delete("/tiles/:id", async (req, res) => {
  try {
    const tileId = req.params.id;

    const tilesFileContent = await fs.readFile("./data/tiles.json", "utf-8");
    const tilesData = JSON.parse(tilesFileContent); // Array
    const updatedTilesData = tilesData.filter((tile) => tile.id !== tileId);

    await fs.writeFile(
      "./data/tiles.json",
      JSON.stringify(updatedTilesData, null, 2),
      "utf-8"
    );

    res.status(200).json({ tiles: updatedTilesData });
  } catch (err) {
    console.error("Chyba při mazání tile:", err);
    res.status(500).json({ message: "Chyba při mazání tile" });
  }
});

// 404
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  res.status(404).json({ message: "404 - Not Found" });
});

app.listen(3000);
