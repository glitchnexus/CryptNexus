#!/usr/bin/env node

import chalk from 'chalk';
import figlet from 'figlet';
import { CryptNexus } from '../src/index.js';

console.log(chalk.cyan(figlet.textSync('CryptNexus', { horizontalLayout: 'full' })));
console.log(chalk.yellow('Created by GlitchNexus - https://github.com/glitchnexusmit\n'));

const vault = new CryptNexus();
vault.initialize().catch(console.error); 