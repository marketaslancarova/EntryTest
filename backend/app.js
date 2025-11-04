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

app.get("/tiles", async (req, res) => {
  // Simulate delay
  // await new Promise((resolve) => setTimeout(resolve, 3000));

  const fileContent = await fs.readFile("./data/tiles.json");
  const tilesData = JSON.parse(fileContent);
  res.status(200).json({ tiles: tilesData });
});

app.put("/tiles", async (req, res) => {
  const newTile = req.body.tile;

  if (!newTile || !newTile.id || !newTile.text) {
    return res.status(400).json({ message: "Invalid tile data" });
  }

  const fileContent = await fs.readFile("./data/tiles.json");
  const tiles = JSON.parse(fileContent);
  const alreadyExists = tiles.some((tile) => tile.id === newTile.id);
  let updatedTiles = tiles;

  if (!alreadyExists) {
    updatedTiles = [...tiles, newTile];
    await fs.writeFile("./data/tiles.json", JSON.stringify(updatedTiles));
  }

  res.status(200).json({ tiles: updatedTiles });
});

app.delete("/tiles/:id", async (req, res) => {
  const tileId = req.params.id;

  const tilesFileContent = await fs.readFile("./data/tiles.json");
  const tilesData = JSON.parse(tilesFileContent);
  const tileIndex = tilesData.findIndex((tile) => tile.id === tileId);
  let updatedTilesData = tilesData;

  if (tileIndex >= 0) {
    updatedTilesData.splice(tileIndex, 1);
  }

  await fs.writeFile("./data/tiles.json", JSON.stringify(updatedTilesData));

  res.status(200).json({ tiles: updatedTilesData });
});

// 404
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  res.status(404).json({ message: "404 - Not Found" });
});

app.listen(3000);
