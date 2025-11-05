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
  console.log("BODY:", req.body);

  if (!newTile || !newTile.text || !newTile.bg || newTile.link === undefined) {
    return res.status(400).json({ message: "Invalid tile data" });
  }

  const fileContent = await fs.readFile("./data/tiles.json");
  const tiles = JSON.parse(fileContent);

  // Determine new id = max(id) + 1
  let newId = 1;
  if (tiles.length > 0) {
    const lastId = Math.max(...tiles.map((tile) => Number(tile.id) || 0));
    newId = lastId + 1;
  }

  newTile.id = newId.toString();

  const updatedTiles = [...tiles, newTile];
  await fs.writeFile(
    "./data/tiles.json",
    JSON.stringify(updatedTiles, null, 2)
  );
  console;
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
