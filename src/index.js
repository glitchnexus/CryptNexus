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
    this.ui = new UI(config);
    this.crypto = new CryptoManager();
    this.storage = new Storage(config);
  }

  async initialize() {
    await this.storage.initialize();
    await this.authenticate();
    await this.startMainLoop();
  }

  async authenticate() {
    const { password } = await inquirer.prompt({
      type: 'password',
      name: 'password',
      message: 'Enter master password:',
      mask: '*'
    });

    this.masterKey = await this.crypto.generateMasterKey(password);
  }

  async startMainLoop() {
    while (true) {
      const choice = await this.ui.showMainMenu();

      switch (choice) {
        case '1':
          await this.viewPasswords();
          break;
        case '2':
          await this.addPassword();
          break;
        case '3':
          await this.generatePassword();
          break;
        case '4':
          console.log(chalk.yellow('\nGoodbye!'));
          process.exit(0);
      }
    }
  }

  async viewPasswords() {
    const data = await this.storage.loadData();
    const decrypted = await Promise.all(
      data.entries.map(entry => this.crypto.decrypt(entry, this.masterKey))
    );
    await this.ui.showPasswordList(decrypted);
  }

  async addPassword() {
    const details = await this.ui.getNewPasswordDetails();
    const encrypted = await this.crypto.encrypt(details, this.masterKey);
    
    const data = await this.storage.loadData();
    data.entries.push(encrypted);
    await this.storage.saveData(data);
    
    console.log(chalk.green('\n✔ Password saved successfully!'));
    await this.ui.pressAnyKey();
  }

  async generatePassword() {
    const password = this.crypto.generateRandomPassword();
    console.log(boxen(
      `${chalk.cyan('Generated Password:')}\n\n${chalk.green(password)}`,
      { padding: 1, borderColor: 'cyan' }
    ));
    await this.ui.pressAnyKey();
  }
}

// CLI için başlangıç noktası
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const vault = new CryptNexus();
  vault.initialize().catch(console.error);
} 