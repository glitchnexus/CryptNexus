export default {
  welcome: {
    title: 'CryptNexus Password Manager',
    subtitle: 'Secure. Simple. Powerful.',
    version: 'Version: %s'
  },
  auth: {
    enterMasterPassword: 'Enter master password:',
    confirmMasterPassword: 'Confirm master password:',
    passwordsDontMatch: 'Passwords do not match',
    invalidPassword: 'Invalid password',
    maxAttemptsReached: 'Maximum login attempts reached',
    loginSuccess: 'Login successful',
    changingPassword: 'Changing master password...',
    passwordChanged: 'Master password changed successfully',
    passwordChangeFailed: 'Failed to change master password'
  },
  menu: {
    main: {
      title: 'What would you like to do?',
      viewPasswords: '📋 View Passwords',
      addPassword: '➕ Add New Password',
      editPassword: '✏️  Edit Password',
      deletePassword: '🗑️  Delete Password',
      generatePassword: '🎲 Generate Password',
      createBackup: '💾 Create Backup',
      settings: '⚙️  Settings',
      exit: '🚪 Exit'
    },
    settings: {
      title: 'Settings',
      language: 'Change Language',
      theme: 'Change Theme',
      masterPassword: 'Change Master Password',
      storage: 'Storage Location',
      security: 'Security Settings',
      export: 'Export Data',
      import: 'Import Data',
      back: 'Back to Main Menu'
    }
  },
  passwords: {
    list: {
      title: 'Saved Passwords',
      empty: 'No passwords saved yet',
      loading: 'Loading passwords...',
      loadError: 'Failed to load passwords'
    },
    add: {
      title: 'Add New Password',
      name: 'Title:',
      username: 'Username:',
      password: 'Password:',
      success: 'Password saved successfully',
      error: 'Failed to save password'
    },
    edit: {
      title: 'Edit Password',
      select: 'Select password to edit:',
      keepEmpty: 'Leave empty to keep current value',
      success: 'Password updated successfully',
      error: 'Failed to update password'
    },
    delete: {
      title: 'Delete Password',
      select: 'Select password to delete:',
      confirm: 'Are you sure you want to delete this password?',
      success: 'Password deleted successfully',
      error: 'Failed to delete password'
    },
    generate: {
      title: 'Generate Password',
      length: 'Password length:',
      options: {
        numbers: 'Include numbers?',
        symbols: 'Include special characters?',
        uppercase: 'Include uppercase letters?',
        excludeSimilar: 'Exclude similar characters? (1, l, I, 0, O)'
      },
      result: 'Generated Password:',
      copy: 'Copy to clipboard?',
      copied: 'Password copied to clipboard!'
    }
  },
  backup: {
    creating: 'Creating backup...',
    success: 'Backup created successfully at: %s',
    error: 'Failed to create backup',
    importing: 'Importing passwords...',
    importSuccess: 'Passwords imported successfully',
    importError: 'Failed to import passwords',
    exporting: 'Exporting passwords...',
    exportSuccess: 'Passwords exported successfully',
    exportError: 'Failed to export passwords'
  },
  errors: {
    general: 'An error occurred',
    fileAccess: 'File access error',
    encryption: 'Encryption error',
    decryption: 'Decryption error',
    invalidFormat: 'Invalid file format',
    invalidConfig: 'Invalid configuration',
    storageInit: 'Failed to initialize storage',
    backupCreation: 'Failed to create backup',
    importFailed: 'Import failed',
    exportFailed: 'Export failed'
  }
}; 