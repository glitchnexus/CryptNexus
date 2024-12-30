import inquirer from 'inquirer';
import chalk from 'chalk';
import figlet from 'figlet';
import ora from 'ora';
import boxen from 'boxen';
import { CryptoManager } from './crypto.js';
import { Storage } from './storage.js';
import { UI } from './ui.js';

export class CryptNexus {
  constructor(config = {}) {
    this.config = {
      theme: 'default',
      language: 'tr',
      storageLocation: './vault',
      ...config
    };

    this.crypto = new CryptoManager();
    this.storage = new Storage(this.config);
    this.ui = new UI(this.config);
    this.masterKey = null;
  }

  async initialize() {
    await this.storage.initialize();
    await this.ui.showWelcome();
    await this.authenticate();
  }

  async authenticate() {
    const maxAttempts = 3;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const { password } = await inquirer.prompt({
        type: 'password',
        name: 'password',
        message: 'Ana şifrenizi girin:',
        mask: '*'
      });

      const spinner = ora('Doğrulanıyor...').start();

      try {
        const meta = await this.storage.loadMeta();
        const { key } = await this.crypto.generateMasterKey(
          password,
          Buffer.from(meta.salt || '', 'hex')
        );
        
        this.masterKey = key;
        spinner.succeed('Giriş başarılı!');
        await this.showMainMenu();
        return;
      } catch (error) {
        spinner.fail('Hatalı şifre!');
        attempts++;
        
        if (attempts === maxAttempts) {
          console.log(chalk.red('Maksimum deneme sayısına ulaşıldı!'));
          process.exit(1);
        }
      }
    }
  }

  async showMainMenu() {
    while (true) {
      const { action } = await this.ui.showMainMenu();

      switch (action) {
        case 'list':
          await this.listPasswords();
          break;
        case 'add':
          await this.addPassword();
          break;
        case 'edit':
          await this.editPassword();
          break;
        case 'delete':
          await this.deletePassword();
          break;
        case 'generate':
          await this.generatePassword();
          break;
        case 'backup':
          await this.createBackup();
          break;
        case 'exit':
          await this.exit();
          return;
      }
    }
  }

  async listPasswords() {
    const spinner = ora('Şifreler yükleniyor...').start();
    
    try {
      const data = await this.storage.loadData();
      const decrypted = await Promise.all(
        data.entries.map(entry => this.crypto.decrypt(entry, this.masterKey))
      );
      
      spinner.stop();
      this.ui.displayPasswords(decrypted);
    } catch (error) {
      spinner.fail('Şifreler yüklenemedi!');
    }
  }

  async addPassword() {
    const { title, username, password } = await this.ui.getPasswordDetails();
    
    const spinner = ora('Şifre kaydediliyor...').start();
    
    try {
      const data = await this.storage.loadData();
      const encrypted = await this.crypto.encrypt(
        { title, username, password },
        this.masterKey
      );
      
      data.entries.push(encrypted);
      await this.storage.saveData(data);
      
      spinner.succeed('Şifre başarıyla kaydedildi!');
    } catch (error) {
      spinner.fail('Şifre kaydedilemedi!');
    }
  }

  async editPassword() {
    const spinner = ora('Şifreler yükleniyor...').start();
    
    try {
      const data = await this.storage.loadData();
      const decrypted = await Promise.all(
        data.entries.map(entry => this.crypto.decrypt(entry, this.masterKey))
      );
      
      spinner.stop();
      
      const { selectedId } = await this.ui.selectPassword(decrypted);
      if (!selectedId) return;
      
      const selectedEntry = data.entries.find(entry => entry.id === selectedId);
      const decryptedEntry = await this.crypto.decrypt(selectedEntry, this.masterKey);
      
      const updatedDetails = await this.ui.editPasswordDetails(decryptedEntry);
      const encrypted = await this.crypto.encrypt(updatedDetails, this.masterKey);
      
      const index = data.entries.findIndex(entry => entry.id === selectedId);
      data.entries[index] = encrypted;
      
      await this.storage.saveData(data);
      console.log(this.ui.theme.secondary('\n✔ Şifre başarıyla güncellendi!'));
    } catch (error) {
      console.log(this.ui.theme.error('\n✖ Şifre güncellenemedi!'));
    }
  }

  async deletePassword() {
    const spinner = ora('Şifreler yükleniyor...').start();
    
    try {
      const data = await this.storage.loadData();
      const decrypted = await Promise.all(
        data.entries.map(entry => this.crypto.decrypt(entry, this.masterKey))
      );
      
      spinner.stop();
      
      const { selectedId, confirmed } = await this.ui.confirmPasswordDeletion(decrypted);
      if (!selectedId || !confirmed) return;
      
      data.entries = data.entries.filter(entry => entry.id !== selectedId);
      await this.storage.saveData(data);
      
      console.log(this.ui.theme.secondary('\n✔ Şifre başarıyla silindi!'));
    } catch (error) {
      console.log(this.ui.theme.error('\n✖ Şifre silinemedi!'));
    }
  }

  async generatePassword() {
    const options = await this.ui.getPasswordGenerationOptions();
    const password = this.crypto.generateRandomPassword(options.length, options);
    await this.ui.displayGeneratedPassword(password);
  }

  async createBackup() {
    const spinner = ora('Yedekleme oluşturuluyor...').start();
    
    try {
      const backupPath = await this.storage.backup();
      spinner.succeed(`Yedekleme başarıyla oluşturuldu: ${backupPath}`);
    } catch (error) {
      spinner.fail('Yedekleme oluşturulamadı!');
    }
  }

  async importPasswords() {
    const { filePath, password } = await this.ui.getImportDetails();
    const spinner = ora('Şifreler içe aktarılıyor...').start();
    
    try {
      const importedData = await this.storage.importData(filePath, password);
      spinner.succeed('Şifreler başarıyla içe aktarıldı!');
      return importedData;
    } catch (error) {
      spinner.fail('Şifreler içe aktarılamadı!');
      throw error;
    }
  }

  async exportPasswords() {
    const { filePath, password } = await this.ui.getExportDetails();
    const spinner = ora('Şifreler dışa aktarılıyor...').start();
    
    try {
      await this.storage.exportData(filePath, password);
      spinner.succeed('Şifreler başarıyla dışa aktarıldı!');
    } catch (error) {
      spinner.fail('Şifreler dışa aktarılamadı!');
      throw error;
    }
  }

  async changeTheme() {
    const { theme } = await this.ui.selectTheme();
    this.config.theme = theme;
    this.ui.updateTheme(theme);
    await this.storage.saveConfig(this.config);
  }

  async changeLanguage() {
    const { language } = await this.ui.selectLanguage();
    this.config.language = language;
    this.ui.updateLanguage(language);
    await this.storage.saveConfig(this.config);
  }

  async changeMasterPassword() {
    const { currentPassword, newPassword, confirmPassword } = 
      await this.ui.getMasterPasswordChangeDetails();
      
    if (newPassword !== confirmPassword) {
      console.log(this.ui.theme.error('\n✖ Yeni şifreler eşleşmiyor!'));
      return;
    }
    
    const spinner = ora('Ana şifre değiştiriliyor...').start();
    
    try {
      await this.storage.changeMasterPassword(currentPassword, newPassword);
      spinner.succeed('Ana şifre başarıyla değiştirildi!');
    } catch (error) {
      spinner.fail('Ana şifre değiştirilemedi!');
    }
  }

  async exit() {
    console.log(chalk.yellow('\nGüvenli bir şekilde çıkılıyor...'));
    process.exit(0);
  }
}

// CLI için başlangıç noktası
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const vault = new CryptNexus();
  vault.initialize().catch(console.error);
} 