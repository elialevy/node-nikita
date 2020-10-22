// Generated by CoffeeScript 2.5.1
// `nikita.file.types.wireguard_conf`

// Pacman is a package manager utility for Arch Linux. The file is usually located 
// in "/etc/pacman.conf".

// ## Schema
var handler, path, schema, utils;

schema = {
  type: 'object',
  properties: {
    'rootdir': {
      type: 'string',
      description: `Path to the mount point corresponding to the root directory, optional.`
    },
    'interface': {
      type: 'string',
      description: `Interface`
    },
    'target': {
      type: 'string',
      description: `Destination file.`
    }
  }
};

// ## Handler
handler = function({config}) {
  //log message: "Entering file.types.wireguard_conf", level: 'DEBUG', module: 'nikita/file/lib/types/wireguard_conf'
  if (config.target == null) {
    config.target = `/etc/wireguard/${config.interface}.conf`;
  }
  if (config.rootdir) {
    config.target = `${path.join(config.rootdir, config.target)}`;
  }
  return this.file.ini({
    parse: utils.ini.parse_multi_brackets,
    stringify: utils.ini.stringify_multi_brackets,
    indent: ''
  }, config);
};

// ## Exports
module.exports = {
  handler: handler,
  schema: schema
};

// ## Dependencies
path = require('path');

utils = require('../utils');