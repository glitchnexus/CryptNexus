import inquirer from 'inquirer';
import chalk from 'chalk';
import figlet from 'figlet';
import boxen from 'boxen';

export class UI {
  constructor(config = {}) {
    this.config = config;
    this.theme = this.loadTheme(config.theme);
  }

  loadTheme(themeName) {
    const themes = {
      default: {
        primary: chalk.blue,
        secondary: chalk.green,
        error: chalk.red,
        warning: chalk.yellow,
        info: chalk.cyan
      },
      dark: {
        primary: chalk.blue.bold,
        secondary: chalk.green.bold,
        error: chalk.red.bold,
        warning: chalk.yellow.bold,
        info: chalk.cyan.bold
      }
      // Diğer temalar...
    };

    return themes[themeName] || themes.default;
  }

  async showWelcome() {
    console.clear();
    console.log(
      boxen(
        chalk.bold(
          figlet.textSync('CryptNexus', { horizontalLayout: 'full' })
        ),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'double',
          borderColor: 'blue'
        }
      )
    );
  }

  async showMainMenu() {
    const choices = [
      { name: this.theme.primary('📋 Şifreleri Listele'), value: 'list' },
      { name: this.theme.primary('➕ Yeni Şifre Ekle'), value: 'add' },
      { name: this.theme.primary('✏️  Şifre Düzenle'), value: 'edit' },
      { name: this.theme.primary('🗑️  Şifre Sil'), value: 'delete' },
      { name: this.theme.primary('🎲 Şifre Oluştur'), value: 'generate' },
      { name: this.theme.primary('💾 Yedekleme Oluştur'), value: 'backup' },
      { name: this.theme.error('🚪 Çıkış'), value: 'exit' }
    ];

    return inquirer.prompt({
      type: 'list',
      name: 'action',
      message: 'Ne yapmak istersiniz?',
      choices
    });
  }

  displayPasswords(passwords) {
    console.clear();
    console.log(this.theme.primary('\n📋 Kayıtlı Şifreler:\n'));

    if (passwords.length === 0) {
      console.log(this.theme.warning('Henüz kayıtlı şifre bulunmuyor.'));
      return;
    }

    passwords.forEach(pwd => {
      console.log(
        boxen(
          `${this.theme.primary('Başlık:')} ${pwd.title}\n` +
          `${this.theme.primary('Kullanıcı Adı:')} ${pwd.username}\n` +
          `${this.theme.primary('Şifre:')} ${pwd.password}`,
          {
            padding: 1,
            margin: 0,
            borderStyle: 'round',
            borderColor: 'blue'
          }
        )
      );
    });
  }

  async getPasswordDetails() {
    return inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Başlık:',
        validate: input => input.length >= 1
      },
      {
        type: 'input',
        name: 'username',
        message: 'Kullanıcı Adı:',
        validate: input => input.length >= 1
      },
      {
        type: 'password',
        name: 'password',
        message: 'Şifre:',
        mask: '*',
        validate: input => input.length >= 8
      }
    ]);
  }

  async selectPassword(passwords) {
    if (passwords.length === 0) {
      console.log(this.theme.warning('Henüz kayıtlı şifre bulunmuyor.'));
      return { selectedId: null };
    }

    const choices = passwords.map(pwd => ({
      name: `${pwd.title} (${pwd.username})`,
      value: pwd.id
    }));

    const { selectedId } = await inquirer.prompt({
      type: 'list',
      name: 'selectedId',
      message: 'Hangi şifreyi düzenlemek istiyorsunuz?',
      choices
    });

    return { selectedId };
  }

  async editPasswordDetails(password) {
    console.log(this.theme.info('\nMevcut değerleri korumak için boş bırakın.'));
    
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Yeni başlık:',
        default: password.title
      },
      {
        type: 'input',
        name: 'username',
        message: 'Yeni kullanıcı adı:',
        default: password.username
      },
      {
        type: 'password',
        name: 'password',
        message: 'Yeni şifre:',
        mask: '*',
        default: password.password
      }
    ]);

    return {
      ...password,
      ...answers
    };
  }

  async confirmPasswordDeletion(passwords) {
    const { selectedId } = await this.selectPassword(passwords);
    if (!selectedId) return { selectedId: null, confirmed: false };

    const { confirmed } = await inquirer.prompt({
      type: 'confirm',
      name: 'confirmed',
      message: 'Bu şifreyi silmek istediğinizden emin misiniz?',
      default: false
    });

    return { selectedId, confirmed };
  }

  async getPasswordGenerationOptions() {
    return inquirer.prompt([
      {
        type: 'number',
        name: 'length',
        message: 'Şifre uzunluğu:',
        default: 16,
        validate: input => input >= 8
      },
      {
        type: 'confirm',
        name: 'numbers',
        message: 'Rakamlar eklensin mi?',
        default: true
      },
      {
        type: 'confirm',
        name: 'symbols',
        message: 'Özel karakterler eklensin mi?',
        default: true
      },
      {
        type: 'confirm',
        name: 'uppercase',
        message: 'Büyük harfler eklensin mi?',
        default: true
      },
      {
        type: 'confirm',
        name: 'excludeSimilar',
        message: 'Benzer karakterler çıkarılsın mı? (1, l, I, 0, O gibi)',
        default: true
      }
    ]);
  }

  async displayGeneratedPassword(password) {
    console.log(
      boxen(
        `${this.theme.primary('Oluşturulan Şifre:')}\n\n` +
        `${this.theme.secondary(password)}`,
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: 'green'
        }
      )
    );

    const { copyToClipboard } = await inquirer.prompt({
      type: 'confirm',
      name: 'copyToClipboard',
      message: 'Şifre panoya kopyalansın mı?',
      default: true
    });

    if (copyToClipboard) {
      // clipboard-copy paketi eklenecek
      await clipboard.write(password);
      console.log(this.theme.info('Şifre panoya kopyalandı!'));
    }
  }

  async selectTheme() {
    const themes = [
      { name: 'Varsayılan', value: 'default' },
      { name: 'Koyu', value: 'dark' },
      { name: 'Renkli', value: 'colorful' },
      { name: 'Minimal', value: 'minimal' }
    ];

    return inquirer.prompt({
      type: 'list',
      name: 'theme',
      message: 'Tema seçin:',
      choices: themes
    });
  }

  async selectLanguage() {
    const languages = [
      { name: 'Türkçe', value: 'tr' },
      { name: 'English', value: 'en' },
      { name: 'Deutsch', value: 'de' },
      { name: 'Español', value: 'es' }
    ];

    return inquirer.prompt({
      type: 'list',
      name: 'language',
      message: 'Dil seçin:',
      choices: languages
    });
  }

  // Diğer UI metodları...
} 