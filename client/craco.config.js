const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(projectRoot, 'client', 'src'),
      '@shared': path.resolve(projectRoot, 'shared'),
    },
    transpileModules: ['@shared'],
  },
};
