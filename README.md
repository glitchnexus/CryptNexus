<div align="center">
  <img src="assets/cryptnexus-banner.png" alt="CryptNexus Banner" width="100%"/>
  
  # 🔐 CryptNexus

  [![npm version](https://img.shields.io/npm/v/cryptnexus.svg?style=flat-square)](https://www.npmjs.com/package/cryptnexus)
  [![Downloads](https://img.shields.io/npm/dt/cryptnexus.svg?style=flat-square)](https://www.npmjs.com/package/cryptnexus)
  [![License](https://img.shields.io/badge/license-CryptNexus--Proprietary-red.svg?style=flat-square)](LICENSE)
  [![Security](https://img.shields.io/badge/Security-Military%20Grade-green.svg?style=flat-square)](SECURITY.md)
  [![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square)](https://www.typescriptlang.org/)

  <h3>Advanced Password Management and Encryption System</h3>
  <h4>Created by <a href="https://github.com/glitchnexus">GlitchNexus</a></h4>
</div>

## ✨ Features

- 🛡️ **Military-Grade Security**: AES-256-GCM encryption
- 🎯 **User-Friendly CLI**: Interactive command-line interface
- 🔄 **Flexible Integration**: Use as CLI tool or npm module
- 🎨 **Customizable**: Themes, languages, and security settings
- 💾 **Secure Storage**: Encrypted local storage with backup
- 🔑 **Password Generator**: Create strong, unique passwords
- 📦 **Import/Export**: Secure data transfer between systems
- 🌍 **Multi-Language**: Support for multiple languages
- ⚡ **High Performance**: Optimized for speed and security
- 📱 **Cross-Platform**: Works on Windows, macOS, and Linux

## 🚀 Quick Start

### As CLI Tool

# Install globally
npm install -g cryptnexus

# Launch password manager
cryptnexus

### As NPM Module

import { CryptNexus } from 'cryptnexus';

// Initialize with custom config
const vault = new CryptNexus({
  storage: './custom-vault',
  security: {
    minPasswordLength: 12
  }
});

// Add password
await vault.addPassword({
  title: 'GitHub',
  username: 'user@example.com',
  password: 'secure-password'
});

// Generate strong password
const password = await vault.generatePassword({
  length: 20,
  numbers: true,
  symbols: true
});

## 🛠️ Configuration

{
  // Core settings
  language: 'en',
  theme: 'default',

  // Storage configuration
  storage: {
    location: './vault',
    backupDir: './backups'
  },

  // Security settings
  security: {
    algorithm: 'aes-256-gcm',
    minPasswordLength: 12,
    maxAttempts: 3
  }
}

## 🎯 CLI Commands

cryptnexus                  # Launch interactive mode
cryptnexus add             # Add new password
cryptnexus generate        # Generate secure password
cryptnexus list           # List all passwords
cryptnexus export         # Export vault
cryptnexus import         # Import vault
cryptnexus backup         # Create backup

## 🔒 Security Features

- AES-256-GCM encryption
- Secure key derivation (PBKDF2)
- Memory-safe password handling
- Encrypted local storage
- Automatic backups
- Brute-force protection
- Session management
- Secure random generation

## 🌍 Supported Languages

- English (default)
- Turkish (Türkçe)
- German (Deutsch)
- Spanish (Español)

## 📚 Documentation

Soon.

## 🤝 Support

- Issues: [GitHub Issues](https://github.com/glitchnexus/cryptnexus/issues)
- Email: support@glitchnexus.com

## ⚖️ License

This project is protected under the CryptNexus Proprietary License.
All rights reserved by GlitchNexus.
Written permission required for any use.

## 🌟 Created by GlitchNexus

<div align="center">
  <a href="https://github.com/glitchnexus">
    <img src="assets/glitchnexus-logo.png" alt="GlitchNexus" width="200"/>
  </a>
  <p>Visit our GitHub for more amazing projects!</p>
</div>
