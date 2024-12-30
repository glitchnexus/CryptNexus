import crypto from 'crypto';
import { promisify } from 'util';
import { EncryptionError } from './errors.js';

const randomBytes = promisify(crypto.randomBytes);
const scrypt = promisify(crypto.scrypt);

export class SecurityManager {
  constructor(config) {
    this.config = config;
  }

  async generateSalt() {
    return randomBytes(this.config.security.saltLength);
  }

  async deriveKey(password, salt) {
    try {
      return await scrypt(
        password,
        salt,
        this.config.security.keyLength,
        {
          N: this.config.security.iterations,
          r: 8,
          p: 1
        }
      );
    } catch (error) {
      throw new EncryptionError('Failed to derive key', { cause: error });
    }
  }

  async generateSecurePassword(length = 16, options = {}) {
    const charset = this._getCharset(options);
    const password = [];
    const randomValues = new Uint8Array(length);
    
    crypto.getRandomValues(randomValues);

    for (let i = 0; i < length; i++) {
      password.push(charset[randomValues[i] % charset.length]);
    }

    return password.join('');
  }

  validatePassword(password) {
    const minLength = this.config.security.minPasswordLength;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    
    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    }
    if (!hasUpperCase) errors.push('Password must contain uppercase letters');
    if (!hasLowerCase) errors.push('Password must contain lowercase letters');
    if (!hasNumbers) errors.push('Password must contain numbers');
    if (!hasSpecialChars) errors.push('Password must contain special characters');

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  _getCharset(options) {
    let charset = '';
    if (options.lowercase !== false) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (options.uppercase !== false) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (options.numbers !== false) charset += '0123456789';
    if (options.special !== false) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    return charset;
  }
} 