#!/usr/bin/env node

import crypto from 'crypto';
import fs from 'fs';
import chalk from 'chalk';
import figlet from 'figlet';

// Ana şifre kontrolü için dosya
const MASTER_PASS_FILE = 'pass';
// Şifrelerin tutulacağı dosya
const PASSWORDS_FILE = 'passes';

function encryptText(text, masterPassword) {
    const algorithm = 'aes-256-gcm';
    const salt = crypto.randomBytes(16);
    const key = crypto.pbkdf2Sync(masterPassword, salt, 100000, 32, 'sha512');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    
    return {
        encrypted,
        iv: iv.toString('hex'),
        salt: salt.toString('hex'),
        authTag: authTag.toString('hex')
    };
}

function decryptText(encryptedData, masterPassword) {
    const algorithm = 'aes-256-gcm';
    const key = crypto.pbkdf2Sync(
        masterPassword,
        Buffer.from(encryptedData.salt, 'hex'),
        100000,
        32,
        'sha512'
    );
    
    const decipher = crypto.createDecipheriv(
        algorithm,
        key,
        Buffer.from(encryptedData.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
}

function initializeVault(masterPassword) {
    // Ana şifreyi şifrele ve kaydet
    const encryptedMasterPass = encryptText(masterPassword, masterPassword);
    fs.writeFileSync(MASTER_PASS_FILE, JSON.stringify(encryptedMasterPass));
    
    // Şifreler için boş dosya oluştur
    fs.writeFileSync(PASSWORDS_FILE, JSON.stringify([]));
}

function validateMasterPassword(masterPassword) {
    try {
        const encryptedData = JSON.parse(fs.readFileSync(MASTER_PASS_FILE));
        const decrypted = decryptText(encryptedData, masterPassword);
        return decrypted === masterPassword;
    } catch {
        return false;
    }
}

function addPassword(title, username, password, masterPassword) {
    const passwords = JSON.parse(fs.readFileSync(PASSWORDS_FILE));
    const encryptedPassword = encryptText(
        JSON.stringify({ title, username, password }),
        masterPassword
    );
    passwords.push(encryptedPassword);
    fs.writeFileSync(PASSWORDS_FILE, JSON.stringify(passwords));
}

function getPasswords(masterPassword) {
    const passwords = JSON.parse(fs.readFileSync(PASSWORDS_FILE));
    return passwords.map(encryptedPass => {
        const decrypted = decryptText(encryptedPass, masterPassword);
        return JSON.parse(decrypted);
    });
}

function generatePassword(length = 16) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset[Math.floor(Math.random() * charset.length)];
    }
    return password;
}

function changeMasterPassword(oldPassword, newPassword) {
    // Önce eski şifrenin doğruluğunu kontrol et
    if (!validateMasterPassword(oldPassword)) {
        throw new Error('Current password is incorrect');
    }

    // Tüm şifreleri al
    const passwords = getPasswords(oldPassword);

    // Yeni master şifreyi kaydet
    const encryptedMasterPass = encryptText(newPassword, newPassword);
    fs.writeFileSync(MASTER_PASS_FILE, JSON.stringify(encryptedMasterPass));

    // Tüm şifreleri yeni master şifre ile tekrar şifrele
    const newEncryptedPasswords = passwords.map(pass => 
        encryptText(JSON.stringify(pass), newPassword)
    );
    fs.writeFileSync(PASSWORDS_FILE, JSON.stringify(newEncryptedPasswords));
}

function updatePassword(index, title, username, password, masterPassword) {
    const passwords = JSON.parse(fs.readFileSync(PASSWORDS_FILE));
    const encryptedPassword = encryptText(
        JSON.stringify({ title, username, password }),
        masterPassword
    );
    passwords[index] = encryptedPassword;
    fs.writeFileSync(PASSWORDS_FILE, JSON.stringify(passwords));
}

function deletePassword(index) {
    const passwords = JSON.parse(fs.readFileSync(PASSWORDS_FILE));
    passwords.splice(index, 1);
    fs.writeFileSync(PASSWORDS_FILE, JSON.stringify(passwords));
}

// Ana program
console.clear();
console.log(chalk.cyan(figlet.textSync('CryptNexus', { horizontalLayout: 'full' })));
console.log(chalk.yellow('\nCreated by GlitchNexus - https://github.com/glitchnexus\n'));

const masterPassExists = fs.existsSync(MASTER_PASS_FILE);

if (!masterPassExists) {
    console.log('First time setup. Please enter a master password:');
    process.stdin.once('data', (data) => {
        const masterPassword = data.toString().trim();
        initializeVault(masterPassword);
        console.log('\nVault initialized. Please restart the program.');
        process.exit();
    });
} else {
    console.log('Enter master password:');
    process.stdin.once('data', (data) => {
        const masterPassword = data.toString().trim();
        
        if (validateMasterPassword(masterPassword)) {
            console.log('\nAccess granted!\n');
            console.log(chalk.green('1.') + ' View Passwords');
            console.log(chalk.green('2.') + ' Add New Password');
            console.log(chalk.green('3.') + ' Generate Password');
            console.log(chalk.green('4.') + ' Edit Password');
            console.log(chalk.green('5.') + ' Delete Password');
            console.log(chalk.green('6.') + ' Change Master Password');
            console.log(chalk.green('7.') + ' Exit');
            
            let currentState = 'menu';
            let tempData = {};

            process.stdin.on('data', (input) => {
                const text = input.toString().trim();

                switch (currentState) {
                    case 'menu':
                        switch (text) {
                            case '1':
                                const passwords = getPasswords(masterPassword);
                                console.log('\nStored Passwords:');
                                passwords.forEach((p, i) => {
                                    console.log(`${i + 1}. ${p.title} (${p.username})`);
                                });
                                break;

                            case '2':
                                currentState = 'add_title';
                                console.log('\nEnter title:');
                                break;

                            case '3':
                                const newPassword = generatePassword();
                                console.log('\nGenerated Password:', newPassword);
                                break;

                            case '4':
                                const editPasswords = getPasswords(masterPassword);
                                console.log('\nSelect password to edit (enter number):');
                                editPasswords.forEach((p, i) => {
                                    console.log(`${i + 1}. ${p.title} (${p.username})`);
                                });
                                currentState = 'edit_select';
                                break;

                            case '5':
                                const delPasswords = getPasswords(masterPassword);
                                console.log('\nSelect password to delete (enter number):');
                                delPasswords.forEach((p, i) => {
                                    console.log(`${i + 1}. ${p.title} (${p.username})`);
                                });
                                currentState = 'delete_select';
                                break;

                            case '6':
                                currentState = 'change_master_new';
                                console.log('\nEnter new master password:');
                                break;

                            case '7':
                                console.log('\nGoodbye!');
                                process.exit(0);
                        }
                        break;

                    case 'add_title':
                        tempData.title = text;
                        currentState = 'add_username';
                        console.log('Enter username:');
                        break;

                    case 'add_username':
                        tempData.username = text;
                        currentState = 'add_password';
                        console.log('Enter password:');
                        break;

                    case 'add_password':
                        addPassword(tempData.title, tempData.username, text, masterPassword);
                        console.log('\nPassword added successfully!');
                        currentState = 'menu';
                        tempData = {};
                        break;

                    case 'edit_select':
                        tempData.index = parseInt(text) - 1;
                        currentState = 'edit_title';
                        console.log('Enter new title:');
                        break;

                    case 'edit_title':
                        tempData.title = text;
                        currentState = 'edit_username';
                        console.log('Enter new username:');
                        break;

                    case 'edit_username':
                        tempData.username = text;
                        currentState = 'edit_password';
                        console.log('Enter new password:');
                        break;

                    case 'edit_password':
                        updatePassword(tempData.index, tempData.title, tempData.username, text, masterPassword);
                        console.log('\nPassword updated successfully!');
                        currentState = 'menu';
                        tempData = {};
                        break;

                    case 'delete_select':
                        deletePassword(parseInt(text) - 1);
                        console.log('\nPassword deleted successfully!');
                        currentState = 'menu';
                        break;

                    case 'change_master_new':
                        try {
                            changeMasterPassword(masterPassword, text);
                            console.log('\nMaster password changed successfully! Please restart the program.');
                            process.exit(0);
                        } catch (error) {
                            console.log('\nFailed to change master password:', error.message);
                            currentState = 'menu';
                        }
                        break;
                }

                if (currentState === 'menu') {
                    console.log('\nSelect an option (1-7):');
                }
            });
        } else {
            console.log('\nIncorrect master password!');
            process.exit(1);
        }
    });
} 