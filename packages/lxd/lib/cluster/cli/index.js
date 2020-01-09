// Generated by CoffeeScript 2.4.1
var parameters;

parameters = require('parameters');

parameters({
  name: 'lxdvmhost',
  description: "LXD VM host based on Virtual Box",
  commands: {
    'start': {
      options: {
        debug: {
          'type': 'boolean'
        }
      },
      route: require('./start')
    },
    'stop': {
      options: {
        debug: {
          'type': 'boolean'
        }
      },
      route: require('./stop')
    }
  }
}).route();