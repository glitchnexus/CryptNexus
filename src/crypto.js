import crypto from 'crypto';
import { nanoid } from 'nanoid';

export class CryptoManager {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32;
    this.ivLength = 16;
    this.saltLength = 64;
    this.tagLength = 16;
    this.iterations = 100000;
    this.digest = 'sha512';
  }

  async generateMasterKey(password, salt = crypto.randomBytes(this.saltLength)) {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(
        password,
        salt,
        this.iterations,
        this.keyLength,
        this.digest,
        (err, key) => {
          if (err) reject(err);
          resolve({ key, salt });
        }
      );
    });
  }

  async encrypt(data, masterKey) {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, masterKey, iv);
    
    const encrypted = Buffer.concat([
      cipher.update(JSON.stringify(data), 'utf8'),
      cipher.final()
    ]);

    const tag = cipher.getAuthTag();
    const id = nanoid();

    return {
      id,
      iv: iv.toString('hex'),
      encryptedData: encrypted.toString('hex'),
      tag: tag.toString('hex'),
      timestamp: Date.now()
    };
  }

  async decrypt(encryptedData, masterKey) {
    try {
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        masterKey,
        Buffer.from(encryptedData.iv, 'hex')
      );

      decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));

      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encryptedData.encryptedData, 'hex')),
        decipher.final()
      ]);

      return JSON.parse(decrypted.toString('utf8'));
    } catch (error) {
      throw new Error('Şifre çözme başarısız oldu');
    }
  }

  generateRandomPassword(length = 16, options = {}) {
    const defaults = {
      numbers: true,
      symbols: true,
      uppercase: true,
      lowercase: true,
      excludeSimilar: true
    };

    const config = { ...defaults, ...options };
    let chars = '';
    let password = '';

    if (config.numbers) chars += '0123456789';
    if (config.symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (config.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (config.lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';

    if (config.excludeSimilar) {
      chars = chars.replace(/[ilLI|`1oO0]/g, '');
    }

    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return password;
  }
} 