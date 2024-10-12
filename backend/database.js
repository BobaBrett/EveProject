import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';
import bz2 from 'unbzip2-stream';

let db;

export async function initializeDatabase() {
  const dbPath = path.join(process.cwd(), 'data', 'market_data.sqlite');
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS market_orders (
      order_id INTEGER PRIMARY KEY,
      duration INTEGER,
      is_buy_order BOOLEAN,
      issued TEXT,
      location_id INTEGER,
      min_volume INTEGER,
      price REAL,
      range TEXT,
      type_id INTEGER,
      volume_remain INTEGER,
      volume_total INTEGER,
      updated_at TEXT
    )
  `);

  // Add more tables for SDE data as needed
  await db.exec(`
    CREATE TABLE IF NOT EXISTS invTypes (
      typeID INTEGER PRIMARY KEY,
      groupID INTEGER,
      typeName TEXT,
      description TEXT,
      mass REAL,
      volume REAL,
      capacity REAL,
      portionSize INTEGER,
      raceID INTEGER,
      basePrice REAL,
      published BOOLEAN,
      marketGroupID INTEGER,
      iconID INTEGER,
      soundID INTEGER
    )
  `);
}

export async function updateMarketData(orders) {
  const stmt = await db.prepare(`
    INSERT OR REPLACE INTO market_orders 
    (order_id, duration, is_buy_order, issued, location_id, min_volume, price, range, type_id, volume_remain, volume_total, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  for (const order of orders) {
    await stmt.run(
      order.order_id,
      order.duration,
      order.is_buy_order,
      order.issued,
      order.location_id,
      order.min_volume,
      order.price,
      order.range,
      order.type_id,
      order.volume_remain,
      order.volume_total
    );
  }

  await stmt.finalize();
}

export async function getLatestMarketData() {
  return db.all('SELECT * FROM market_orders ORDER BY updated_at DESC LIMIT 1000');
}

export async function backupDatabase() {
  const dbPath = path.join(process.cwd(), 'data', 'market_data.sqlite');
  const backupDir = path.join(process.cwd(), 'data', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `market_data_${timestamp}.sqlite`);

  await db.close();
  fs.copyFileSync(dbPath, backupPath);
  
  // Reopen the database
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  console.log(`Database backed up to ${backupPath}`);
}

export async function processSDE(filePath) {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(filePath);
    const unzipStream = readStream.pipe(bz2());

    let buffer = '';
    unzipStream.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop();

      lines.forEach(async (line) => {
        try {
          const data = JSON.parse(line);
          if (data.typeID) {
            await insertInvType(data);
          }
          // Add more conditions for other SDE tables
        } catch (error) {
          console.error('Error processing SDE line:', error);
        }
      });
    });

    unzipStream.on('end', () => {
      if (buffer.length > 0) {
        try {
          const data = JSON.parse(buffer);
          if (data.typeID) {
            insertInvType(data);
          }
          // Add more conditions for other SDE tables
        } catch (error) {
          console.error('Error processing last SDE line:', error);
        }
      }
      resolve();
    });

    unzipStream.on('error', (error) => {
      reject(error);
    });
  });
}

async function insertInvType(data) {
  const stmt = await db.prepare(`
    INSERT OR REPLACE INTO invTypes 
    (typeID, groupID, typeName, description, mass, volume, capacity, portionSize, raceID, basePrice, published, marketGroupID, iconID, soundID)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  await stmt.run(
    data.typeID,
    data.groupID,
    data.typeName,
    data.description,
    data.mass,
    data.volume,
    data.capacity,
    data.portionSize,
    data.raceID,
    data.basePrice,
    data.published,
    data.marketGroupID,
    data.iconID,
    data.soundID
  );

  await stmt.finalize();
}