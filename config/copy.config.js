const defaultConfig = require('@ionic/app-scripts/config/copy.config');

module.exports = Object.assign({}, defaultConfig, {
  copyData: {
    src: ['{{SRC}}/data/books/**/*'],
    dest: '{{WWW}}/data',
  },
});