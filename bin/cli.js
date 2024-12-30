#!/usr/bin/env node

import chalk from 'chalk';
import figlet from 'figlet';

console.clear();
console.log(chalk.cyan(figlet.textSync('CryptNexus', { horizontalLayout: 'full' })));
console.log(chalk.yellow('\nCreated by GlitchNexus - https://github.com/glitchnexusmit\n'));

console.log(chalk.green('1.') + ' View Passwords');
console.log(chalk.green('2.') + ' Add New Password');
console.log(chalk.green('3.') + ' Generate Password');

process.stdin.on('data', (data) => {
  const choice = data.toString().trim();

  switch (choice) {
    case '1':
      console.log('\nStored Passwords:');
      console.log('Gmail (user@gmail.com)');
      console.log('GitHub (glitchnexus)');
      console.log('Netflix (user@example.com)');
      break;
      
    case '2':
      console.log('\nAdd New Password Selected');
      break;
      
    case '3':
      console.log('\nGenerate Password Selected');
      break;
      
    default:
      console.log('\nInvalid option');
  }
}); 