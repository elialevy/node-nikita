// Generated by CoffeeScript 2.5.1
// # `nikita.docker.service`

// Run a container in a service mode. This module is just a wrapper for docker.run
// with correct options.

// Indeed, in a service mode, the container must be detached and NOT removed by default
// after execution. 

// ## Options

// See `docker.run` for list of options.

// ## Source Code
module.exports = function({options}) {
  var k, ref, v;
  this.log({
    message: "Entering Docker service",
    level: 'DEBUG',
    module: 'nikita/lib/docker/service'
  });
  // Global options
  if (options.docker == null) {
    options.docker = {};
  }
  ref = options.docker;
  for (k in ref) {
    v = ref[k];
    if (options[k] == null) {
      options[k] = v;
    }
  }
  // Normalization
  if (options.detach == null) {
    options.detach = true;
  }
  if (options.rm == null) {
    options.rm = false;
  }
  if (!((options.name != null) || (options.container != null))) {
    // Validation
    throw Error('Missing container name');
  }
  return this.docker.run(options);
};
