// Generated by CoffeeScript 2.5.1
// registration of `nikita.file` actions
var registry;

require('@nikitajs/file/lib/register');

registry = require('@nikitajs/engine/lib/registry');

module.exports = {
  docker: {
    build: '@nikitajs/docker/lib/build',
    // compose:
    //   '': '@nikitajs/docker/lib/compose'
    //   up: '@nikitajs/docker/lib/compose'
    // cp: '@nikitajs/docker/lib/cp'
    // exec: '@nikitajs/docker/lib/exec'
    // kill: '@nikitajs/docker/lib/kill'
    // load: '@nikitajs/docker/lib/load'
    // pause: '@nikitajs/docker/lib/pause'
    pull: '@nikitajs/docker/lib/pull',
    // restart: '@nikitajs/docker/lib/restart'
    // rm: '@nikitajs/docker/lib/rm'
    rmi: '@nikitajs/docker/lib/rmi',
    // run: '@nikitajs/docker/lib/run'
    // save: '@nikitajs/docker/lib/save'
    // service: '@nikitajs/docker/lib/service'
    // start: '@nikitajs/docker/lib/start'
    // status: '@nikitajs/docker/lib/status'
    // stop: '@nikitajs/docker/lib/stop'
    tools: {
      checksum: '@nikitajs/docker/lib/tools/checksum',
      execute: '@nikitajs/docker/lib/tools/execute'
    }
  }
};

(async function() {  // unpause: '@nikitajs/docker/lib/unpause'
  // volume_create: '@nikitajs/docker/lib/volume_create'
  // volume_rm: '@nikitajs/docker/lib/volume_rm'
  // wait: '@nikitajs/docker/lib/wait'
  return (await registry.register(module.exports));
})();
