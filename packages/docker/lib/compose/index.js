// Generated by CoffeeScript 2.5.1
// # `nikita.docker.compose`

// Create and start containers according to a docker-compose file
// `nikita.docker.compose` is an alias to `nikita.docker.compose.up`

// ## Options

// * `boot2docker` (boolean)   
//   Whether to use boot2docker or not, default to false.
// * `machine` (string)   
//   Name of the docker-machine, required if using docker-machine.
// * `content` (string)   
//   The content of the docker-compose.yml to write if not exist.
// * `eof` (string)   
//   Inherited from nikita.file use when writing docker-compose.yml file.
// * `backup` (string|boolean)   
//   Create a backup, append a provided string to the filename extension or a
//   timestamp if value is not a string, only apply if the target file exists and
//   is modified.
// * `detached` (boolean)   
//   Run Containers in detached mode. Default to true.
// * `force` (boolean)   
//   Force to re-create the containers if the config and image have not changed
//   Default to false
// * `services` (string|array)
//   Specify specific services to create.
// * `target` (string)   
//   The docker-compose.yml absolute's file's path, required if no content is 
//   specified.
// * `code` (int|array)   
//   Expected code(s) returned by the command, int or array of int, default to 0.
// * `code_skipped`   
//   Expected code(s) returned by the command if it has no effect, executed will
//   not be incremented, int or array of int.

// ## Callback parameters

// *   `err`   
//     Error object if any.   
// *   `executed`   
//     if command was executed   
// *   `stdout`   
//     Stdout value(s) unless `stdout` option is provided.   
// *   `stderr`   
//     Stderr value(s) unless `stderr` option is provided.   

// ## Source Code
var docker, path;

module.exports = function({
    config,
    log,
    operations: {find}
  }) {
  var clean_target, cmd, cmd_ps, cmd_up, k, ref, services, source_dir, v;
  log({
    message: "Entering Docker Compose",
    level: 'DEBUG',
    module: 'nikita/lib/docker/compose/up'
  });
  // Global config
  if (config.docker == null) {
    config.docker = {};
  }
  ref = config.docker;
  for (k in ref) {
    v = ref[k];
    if (config[k] == null) {
      config[k] = v;
    }
  }
  if ((config.target == null) && (config.content == null)) {
    // Validate parameters
    throw Error('Missing docker-compose content or target');
  }
  if (config.content && (config.target == null)) {
    if (config.target == null) {
      config.target = `/tmp/nikita_docker_compose_${Date.now()}/docker-compose.yml`;
    }
    clean_target = true;
  }
  if (config.detached == null) {
    config.detached = true;
  }
  if (config.force == null) {
    config.force = false;
  }
  if (config.recreate == null) {
    config.recreate = false;
  }
  if (config.services == null) {
    config.services = [];
  }
  if (!Array.isArray(config.services)) {
    config.services = [config.services];
  }
  services = config.services.join(' ');
  // Construct exec command
  cmd = ` --file ${config.target}`;
  cmd_ps = `${cmd} ps -q | xargs docker ${docker.opts(config)} inspect`;
  cmd_up = `${cmd} up`;
  if (config.detached) {
    cmd_up += ' -d ';
  }
  if (config.force) {
    cmd_up += ' --force-recreate ';
  }
  cmd_up += ` ${services}`;
  source_dir = `${path.dirname(config.target)}`;
  if (config.eof == null) {
    config.eof = true;
  }
  if (config.backup == null) {
    config.backup = false;
  }
  config.compose = true;
  this.call(function() {
    return this.file.yaml({
      if: config.content != null,
      eof: config.eof,
      backup: config.backup,
      target: config.target,
      content: config.content
    });
  });
  this.call(function(_, callback) {
    return this.execute({
      cmd: docker.wrap(config, cmd_ps),
      cwd: config.cwd,
      uid: config.uid,
      code_skipped: 123,
      stdout_log: false
    }, function(err, {status, stdout}) {
      var containers;
      if (err) {
        return callback(err);
      }
      if (!status) {
        return callback(null, true);
      }
      containers = JSON.parse(stdout);
      status = containers.some(function(container) {
        return !container.State.Running;
      });
      if (status) {
        log("Docker created, need start");
      }
      return callback(null, status);
    });
  });
  this.execute({
    if: function() {
      return config.force || this.status();
    },
    cwd: source_dir,
    uid: config.uid,
    cmd: docker.wrap(config, cmd_up)
  }, docker.callback);
  return this.system.remove({
    if: clean_target,
    target: config.target,
    always: true // Not yet implemented
  });
};


// ## Dependencies
docker = require('./utils');

path = require('path');
