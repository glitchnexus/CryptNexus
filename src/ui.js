import inquirer from 'inquirer';
import chalk from 'chalk';
import figlet from 'figlet';
import boxen from 'boxen';

export class UI {
  constructor(config = {}) {
    this.config = config;
  }

  async showMainMenu() {
    console.clear();
    console.log(chalk.cyan(figlet.textSync('CryptNexus', { horizontalLayout: 'full' })));
    console.log(chalk.yellow('\nCreated by GlitchNexus - https://github.com/glitchnexusmit\n'));

    const { choice } = await inquirer.prompt({
      type: 'list',
      name: 'choice',
      message: 'Select an option:',
      choices: [
        { name: '1. View Passwords', value: '1' },
        { name: '2. Add New Password', value: '2' },
        { name: '3. Generate Password', value: '3' },
        { name: '4. Exit', value: '4' }
      ]
    });

    return choice;
  }

  async showPasswordList(passwords) {
    console.clear();
    console.log(chalk.cyan('\n📋 Saved Passwords:\n'));

    const { selectedId } = await inquirer.prompt({
      type: 'list',
      name: 'selectedId',
      message: 'Select a password to view:',
      choices: passwords.map(pwd => ({
        name: `${pwd.title} (${pwd.username})`,
        value: pwd.id
      }))
    });

    const password = passwords.find(p => p.id === selectedId);
    
    console.log(boxen(
      `${chalk.cyan('Title:')} ${password.title}\n` +
      `${chalk.cyan('Username:')} ${password.username}\n` +
      `${chalk.cyan('Password:')} ${chalk.green(password.password)}`,
      { padding: 1, borderColor: 'cyan' }
    ));

    await this.pressAnyKey();
  }

  async getNewPasswordDetails() {
    return inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Enter title:',
        validate: input => input.length >= 1
      },
      {
        type: 'input',
        name: 'username',
        message: 'Enter username:',
        validate: input => input.length >= 1
      },
      {
        type: 'password',
        name: 'password',
        message: 'Enter password:',
        mask: '*'
      }
    ]);
  }

  async pressAnyKey() {
    await inquirer.prompt({
      type: 'input',
      name: 'continue',
      message: 'Press Enter to continue...'
    });
  }
} 