// Generated by CoffeeScript 2.5.1
// # `nikita.lxd.config.set`

// Set container or server configuration keys.

// ## Set a configuration key

// ```js
// const {status} = await nikita.lxd.config.set({
//   config: {
//     name: "my_container",
//     properties: {
//       'boot.autostart.priority': 100
//     }
//   }
// })
// console.info(`Property was set: ${status}`)
// ```

// ## Schema
var diff, handler, merge, schema, yaml;

schema = {
  type: 'object',
  properties: {
    'container': {
      $ref: 'module://@nikitajs/lxd/src/init#/properties/container'
    },
    'properties': {
      type: 'object',
      patternProperties: {
        '': {
          type: ['string', 'boolean', 'number']
        }
      },
      description: `One or multiple keys to set.`
    }
  },
  required: ['container', 'properties']
};

// ## Handler
handler = async function({config}) {
  var changes, k, key, keys, properties, ref, status, stdout, v, value;
  ref = config.properties;
  // log message: "Entering lxd.config.set", level: 'DEBUG', module: '@nikitajs/lxd/lib/config/set'
  // Normalize config
  for (k in ref) {
    v = ref[k];
    if (typeof v === 'string') {
      continue;
    }
    config.properties[k] = v.toString();
  }
  keys = {};
  ({stdout} = (await this.execute({
    command: `${['lxc', 'config', 'show', config.container].join(' ')}`,
    shy: true,
    code_skipped: 42
  })));
  ({
    config: properties
  } = yaml.safeLoad(stdout));
  changes = diff(properties, merge(properties, config.properties));
  for (key in changes) {
    value = changes[key];
    // if changes is empty status is false because no command were executed
    // Note, it doesnt seem possible to set multiple keys in one command
    ({status} = (await this.execute({
      command: ['lxc', 'config', 'set', config.container, key, `'${value.replace('\'', '\\\'')}'`].join(' ')
    })));
  }
  return {
    status: status
  };
};

// ## Exports
module.exports = {
  handler: handler,
  schema: schema
};

// ## Dependencies
({merge} = require('mixme'));

yaml = require('js-yaml');

diff = require('object-diff');
