export class CryptNexusError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'CryptNexusError';
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends CryptNexusError {
  constructor(message, details) {
    super('VALIDATION_ERROR', message, details);
    this.name = 'ValidationError';
  }
}

export class EncryptionError extends CryptNexusError {
  constructor(message, details) {
    super('ENCRYPTION_ERROR', message, details);
    this.name = 'EncryptionError';
  }
}

export class StorageError extends CryptNexusError {
  constructor(message, details) {
    super('STORAGE_ERROR', message, details);
    this.name = 'StorageError';
  }
}

export class AuthenticationError extends CryptNexusError {
  constructor(message, details) {
    super('AUTH_ERROR', message, details);
    this.name = 'AuthenticationError';
  }
} 