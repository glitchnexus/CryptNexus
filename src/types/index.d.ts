export interface CryptNexusConfig {
  language: string;
  theme: string;
  storage: {
    location: string;
    backupDir: string;
    fileExtension: string;
  };
  security: {
    iterations: number;
    keyLength: number;
    saltLength: number;
    algorithm: string;
    minPasswordLength: number;
    maxAttempts: number;
  };
  ui: {
    showWelcomeBanner: boolean;
    clearScreenOnMenuChange: boolean;
    confirmOnExit: boolean;
    copyToClipboardTimeout: number;
  };
}

export interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, any>;
}

export interface EncryptedData {
  id: string;
  iv: string;
  encryptedData: string;
  tag: string;
  timestamp: number;
}

// Diğer type tanımlamaları... 