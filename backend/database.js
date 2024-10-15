import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';
import bz2 from 'unbzip2-stream';

let db;

export async function initializeDatabase() {
  const dbPath = path.join(process.cwd(), 'data', 'projectDB.sqlite');
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
    );
    CREATE TABLE IF NOT EXISTS auth_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      access_token TEXT,
      refresh_token TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);


  return db;
}


export async function updateMarketData(db, orders) {
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

export async function getLatestMarketData(db) {
  return db.all('SELECT * FROM market_orders ORDER BY updated_at DESC LIMIT 1000');
}

export async function backupDatabase() {
  const dbPath = path.join(process.cwd(), 'data', 'projectdb.sqlite');
  const backupDir = path.join(process.cwd(), 'data', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `projectdb_${timestamp}.sqlite`);

  await db.close();
  fs.copyFileSync(dbPath, backupPath);
  
  // Reopen the database
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  console.log(`Database backed up to ${backupPath}`);
}

export async function getLatestAuthToken(db) {
  const row = await db.get('SELECT access_token FROM auth_tokens ORDER BY updated_at DESC LIMIT 1');
  return row ? row.access_token : null;
}