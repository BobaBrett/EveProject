import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';
import bz2 from 'unbzip2-stream';

let db;

export async function initiatliseSDE() {
  const dbPath = path.join(process.cwd(), 'data', 'sde.sqlite');
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  return db;
}


export async function processSDE(filePath) {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(filePath);
    const unzipStream = readStream.pipe(bz2());
    const outputFilePath = path.join(process.cwd(), 'data', 'sde.sqlite');
    const writeStream = fs.createWriteStream(outputFilePath);

    unzipStream.pipe(writeStream);

    writeStream.on('finish', () => {
      resolve();
    });

    writeStream.on('error', (error) => {
      reject(error);
    });

    unzipStream.on('error', (error) => {
      reject(error);
    });
  });
}
