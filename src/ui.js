#!/usr/bin/env node

import crypto from 'crypto';
import fs from 'fs';
import chalk from 'chalk';
import figlet from 'figlet';
import inquirer from 'inquirer';

// Ana şifre kontrolü için dosya
const MASTER_PASS_FILE = 'pass';
// Şifrelerin tutulacağı dosya
const PASSWORDS_FILE = 'passes';

// Şifreleme fonksiyonları
function encrypt(text, key) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]).toString('hex');
}

function decrypt(encryptedHex, key) {
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const iv = encrypted.slice(0, 16);
    const tag = encrypted.slice(16, 32);
    const text = encrypted.slice(32);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    return decipher.update(text) + decipher.final('utf8');
}

function deriveKey(password) {
    return crypto.scryptSync(password, 'salt', 32);
}

function initializeVault(masterPassword) {
    const key = deriveKey(masterPassword);
    const hash = crypto.createHash('sha256').update(masterPassword).digest('hex');
    fs.writeFileSync(MASTER_PASS_FILE, hash);
    fs.writeFileSync(PASSWORDS_FILE, encrypt('{}', key));
}

function validateMasterPassword(password) {
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    return hash === fs.readFileSync(MASTER_PASS_FILE, 'utf8');
}

function loadPasswords(masterPassword) {
    const key = deriveKey(masterPassword);
    const encrypted = fs.readFileSync(PASSWORDS_FILE, 'utf8');
    return JSON.parse(decrypt(encrypted, key));
}

function savePasswords(passwords, masterPassword) {
    const key = deriveKey(masterPassword);
    fs.writeFileSync(PASSWORDS_FILE, encrypt(JSON.stringify(passwords), key));
}

function generatePassword(length = 16) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset[Math.floor(Math.random() * charset.length)];
    }
    return password;
}

// Ana program
async function main() {
    console.clear();
    console.log(chalk.cyan(figlet.textSync('CryptNexus', { horizontalLayout: 'full' })));
    console.log(chalk.yellow('\nCreated by GlitchNexus - https://github.com/glitchnexus\n'));

    const masterPassExists = fs.existsSync(MASTER_PASS_FILE);

    if (!masterPassExists) {
        const { masterPassword } = await inquirer.prompt([{
            type: 'password',
            name: 'masterPassword',
            message: 'First time setup. Please enter a master password:'
        }]);
        initializeVault(masterPassword);
        console.log('\nVault initialized. Please restart the program.');
        process.exit();
    }

    const { masterPassword } = await inquirer.prompt([{
        type: 'password',
        name: 'masterPassword',
        message: 'Enter master password:'
    }]);

    if (!validateMasterPassword(masterPassword)) {
        console.log(chalk.red('Invalid master password!'));
        process.exit(1);
    }

    console.log('\nAccess granted!\n');

    while (true) {
        const { action } = await inquirer.prompt([{
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                'View Passwords',
                'Add New Password',
                'Generate Password',
                'Edit Password',
                'Delete Password',
                'Change Master Password',
                'Exit'
            ]
        }]);

        const passwords = loadPasswords(masterPassword);

        switch (action) {
            case 'View Passwords':
                if (Object.keys(passwords).length === 0) {
                    console.log(chalk.yellow('\nNo passwords stored yet.'));
                } else {
                    console.log('\nStored Passwords:');
                    Object.entries(passwords).forEach(([service, password]) => {
                        console.log(chalk.green(`${service}: ${password}`));
                    });
                }
                break;

            case 'Add New Password':
                const { service, password } = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'service',
                        message: 'Enter service name:'
                    },
                    {
                        type: 'password',
                        name: 'password',
                        message: 'Enter password:'
                    }
                ]);
                passwords[service] = password;
                savePasswords(passwords, masterPassword);
                console.log(chalk.green('\nPassword saved successfully!'));
                break;

            case 'Generate Password':
                const { length } = await inquirer.prompt([{
                    type: 'number',
                    name: 'length',
                    message: 'Enter password length:',
                    default: 16
                }]);
                const generatedPassword = generatePassword(length);
                console.log(chalk.green(`\nGenerated Password: ${generatedPassword}`));
                break;

            case 'Edit Password':
                if (Object.keys(passwords).length === 0) {
                    console.log(chalk.yellow('\nNo passwords to edit.'));
                    break;
                }
                const { serviceToEdit } = await inquirer.prompt([{
                    type: 'list',
                    name: 'serviceToEdit',
                    message: 'Select service to edit:',
                    choices: Object.keys(passwords)
                }]);
                const { newPassword } = await inquirer.prompt([{
                    type: 'password',
                    name: 'newPassword',
                    message: 'Enter new password:'
                }]);
                passwords[serviceToEdit] = newPassword;
                savePasswords(passwords, masterPassword);
                console.log(chalk.green('\nPassword updated successfully!'));
                break;

            case 'Delete Password':
                if (Object.keys(passwords).length === 0) {
                    console.log(chalk.yellow('\nNo passwords to delete.'));
                    break;
                }
                const { serviceToDelete } = await inquirer.prompt([{
                    type: 'list',
                    name: 'serviceToDelete',
                    message: 'Select service to delete:',
                    choices: Object.keys(passwords)
                }]);
                delete passwords[serviceToDelete];
                savePasswords(passwords, masterPassword);
                console.log(chalk.green('\nPassword deleted successfully!'));
                break;

            case 'Change Master Password':
                const { newMasterPassword } = await inquirer.prompt([{
                    type: 'password',
                    name: 'newMasterPassword',
                    message: 'Enter new master password:'
                }]);
                const oldPasswords = loadPasswords(masterPassword);
                initializeVault(newMasterPassword);
                savePasswords(oldPasswords, newMasterPassword);
                console.log(chalk.green('\nMaster password changed successfully!'));
                return;

            case 'Exit':
                console.log(chalk.yellow('\nGoodbye!'));
                return;
        }
        console.log('\n');
    }
}

export default main; 