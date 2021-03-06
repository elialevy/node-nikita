// Generated by CoffeeScript 2.5.1
// # `nikita.system.mod`

// Load a kernel module. By default, unless the `persist` options is "false",
// module are loaded on reboot by writing the file "/etc/modules-load.d/{name}.conf".

// ## Options

// *   `modules` (object|string)   
//     Names of the modules.
// *   `names` (object|string)   
//     Deprecated, see `modules`.
// *   `load` (booleaan)   
//     Load the module, default is "true".
// *   `persist` (booleaan)   
//     Load the module on startup, default is "true".
// *   `target` (string)   
//     Path of the file to write the module, relative to "/etc/modules-load.d"
//     unless absolute, default to "/etc/modules-load.d/{options.name}.conf".

// ## Examples

// Activate the module "vboxpci" in the file "/etc/modules-load.d/vboxpci.conf":

// ```
// require('nikita')
// .system.mod({
//   name: 'vboxpci'
// });
// ```

// Activate the module "vboxpci" in the file "/etc/modules-load.d/my_modules.conf":

// ```
// require('nikita')
// .system.mod({
//   target: 'my_modules.conf',
//   name: 'vboxpci'
// });
// ```

// ## Options
var handler, on_options, path, quote;

on_options = function({options}) {
  if (options.name) {
    console.warn('Module system.mod: options `name` is deprecated in favor of `modules`');
    options.modules = options.name;
    delete options.name;
  }
  if (options.name && typeof options.name === 'string') {
    return options.name = {
      [options.name]: true
    };
  }
};

// ## Handler
handler = function({metadata, options}) {
  var active, module, modules;
  if (metadata.argument != null) {
    options.modules = metadata.argument;
  }
  if (options.target == null) {
    options.target = `${options.modules}.conf`;
  }
  options.target = path.resolve('/etc/modules-load.d', options.target);
  if (options.load == null) {
    options.load = true;
  }
  if (options.persist == null) {
    options.persist = true;
  }
  if (!options.modules) {
    throw Error("Required Option: modules");
  }
  modules = (function() {
    var ref, results;
    ref = options.modules;
    results = [];
    for (module in ref) {
      active = ref[module];
      if (active) {
        results.push(module);
      } else {
        results.push(void 0);
      }
    }
    return results;
  })();
  this.system.execute({
    if: options.load,
    cmd: `lsmod | grep ${options.modules} && exit 3
modprobe ${modules.join(' ')}`,
    code_skipped: 3
  });
  return this.file({
    if: options.persist,
    target: options.target,
    match: RegExp(`^${quote(options.modules)}$`, "m"),
    replace: options.modules,
    append: true,
    eof: true
  });
};

// ## Exports
module.exports = {
  on_options: on_options,
  handler: handler
};

// ## Dependencies
path = require('path');

quote = require('regexp-quote');
