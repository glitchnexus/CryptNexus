import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class Storage {
  constructor(config = {}) {
    this.baseDir = config.storageLocation || path.join(__dirname, '../vault');
    this.metaFile = 'meta.json';
    this.dataFile = 'vault.enc';
  }

  async initialize() {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
      
      const metaExists = await this.fileExists(this.metaFile);
      if (!metaExists) {
        await this.saveMeta({
          version: '1.0.0',
          created: Date.now(),
          lastModified: Date.now()
        });
      }
      
      const dataExists = await this.fileExists(this.dataFile);
      if (!dataExists) {
        await this.saveData({ entries: [] });
      }
    } catch (error) {
      throw new Error(`Depolama başlatılamadı: ${error.message}`);
    }
  }

  async fileExists(filename) {
    try {
      await fs.access(path.join(this.baseDir, filename));
      return true;
    } catch {
      return false;
    }
  }

  async loadMeta() {
    try {
      const data = await fs.readFile(
        path.join(this.baseDir, this.metaFile),
        'utf8'
      );
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Meta verisi okunamadı: ${error.message}`);
    }
  }

  async saveMeta(meta) {
    try {
      await fs.writeFile(
        path.join(this.baseDir, this.metaFile),
        JSON.stringify(meta, null, 2)
      );
    } catch (error) {
      throw new Error(`Meta verisi kaydedilemedi: ${error.message}`);
    }
  }

  async loadData() {
    try {
      const data = await fs.readFile(
        path.join(this.baseDir, this.dataFile),
        'utf8'
      );
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Veriler okunamadı: ${error.message}`);
    }
  }

  async saveData(data) {
    try {
      await fs.writeFile(
        path.join(this.baseDir, this.dataFile),
        JSON.stringify(data, null, 2)
      );
      
      await this.updateMeta();
    } catch (error) {
      throw new Error(`Veriler kaydedilemedi: ${error.message}`);
    }
  }

  async updateMeta() {
    const meta = await this.loadMeta();
    meta.lastModified = Date.now();
    await this.saveMeta(meta);
  }

  async backup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(this.baseDir, 'backups', timestamp);
    
    try {
      await fs.mkdir(backupDir, { recursive: true });
      
      const files = [this.metaFile, this.dataFile];
      for (const file of files) {
        const content = await fs.readFile(path.join(this.baseDir, file));
        await fs.writeFile(path.join(backupDir, file), content);
      }
      
      return backupDir;
    } catch (error) {
      throw new Error(`Yedekleme oluşturulamadı: ${error.message}`);
    }
  }
} 