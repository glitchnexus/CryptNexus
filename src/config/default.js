export default {
  language: 'en',
  theme: 'default',
  storage: {
    location: './vault',
    backupDir: './backups',
    fileExtension: '.vault'
  },
  security: {
    iterations: 100000,
    keyLength: 32,
    saltLength: 64,
    algorithm: 'aes-256-gcm',
    minPasswordLength: 8,
    maxAttempts: 3
  },
  ui: {
    showWelcomeBanner: true,
    clearScreenOnMenuChange: true,
    confirmOnExit: true,
    copyToClipboardTimeout: 5000
  }
}; 