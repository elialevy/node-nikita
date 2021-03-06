// Generated by CoffeeScript 2.5.1
// # `nikita.krb5.execute(options, [callback])`

// Execute a Kerberos command.

// ## Options

// * `admin.server`   
//   Address of the kadmin server; optional, use "kadmin.local" if missing.   
// * `admin.principal`   
//   KAdmin principal name unless `kadmin.local` is used.   
// * `admin.password`   
//   Password associated to the KAdmin principal.   
// * `principal`   
//   Principal to be created.   
// * `keytab`   
//   Path to the file storing key entries.   

// ## Example

// ```
// require('nikita')
// .krb5_delrinc({
//   principal: 'myservice/my.fqdn@MY.REALM',
//   keytab: '/etc/security/keytabs/my.service.keytab',
//   admin: {
//     principal: 'me/admin@MY_REALM',
//     password: 'pass',
//     server: 'localhost'
//   }
// }, function(err, status){
//   console.info(err ? err.message : 'Principal removed: ' + status);
// });
// ```

// ## Schema
var handler, mutate, on_options, regexp, schema;

schema = {
  type: 'object',
  properties: {
    'admin': {
      type: 'object',
      properties: {
        'realm': {
          type: 'string'
        },
        'principal': {
          type: 'string'
        },
        'server': {
          type: 'string'
        },
        'password': {
          type: 'string'
        }
      }
    },
    'cmd': {
      type: 'string'
    },
    'grep': {
      type: 'string'
    },
    'egrep': {
      instanceof: 'RegExp'
    }
  },
  required: ['admin', 'cmd']
};

// ## Hooks
on_options = function({options}) {
  // Import all properties from `options.krb5`
  if (options.krb5) {
    mutate(options, options.krb5);
    delete options.krb5;
  }
  if (regexp.is(options.grep)) {
    options.egrep = options.grep;
    return delete options.grep;
  }
};

// ## Handler
handler = function({options}, callback) {
  var realm;
  realm = options.admin.realm ? `-r ${options.admin.realm}` : '';
  return this.system.execute({
    cmd: options.admin.principal ? `kadmin ${realm} -p ${options.admin.principal} -s ${options.admin.server} -w ${options.admin.password} -q '${options.cmd}'` : `kadmin.local ${realm} -q '${options.cmd}'`
  }, function(err, {stdout}) {
    if (err) {
      return callback(err);
    }
    if (options.grep) {
      return callback(null, {
        stdout: stdout,
        status: stdout.split('\n').some(function(line) {
          return line === options.grep;
        })
      });
    }
    if (options.egrep) {
      return callback(null, {
        stdout: stdout,
        status: stdout.split('\n').some(function(line) {
          return options.egrep.test(line);
        })
      });
    }
    return callback(null, {
      status: true,
      stdout: stdout
    });
  });
};

// ## Export
module.exports = {
  handler: handler,
  on_options: on_options,
  schema: schema
};

// ## Dependencies
({mutate} = require('mixme'));

({regexp} = require('@nikitajs/core/lib/misc'));
