// Generated by CoffeeScript 2.4.1
// # `nikita.service.startup`

// Activate or desactivate a service on startup.

// ## Options

// * `arch_chroot` (boolean|string)   
//   Run this command inside a root directory with the arc-chroot command or any 
//   provided string, require the "rootdir" option if activated.   
// * `rootdir` (string)   
//   Path to the mount point corresponding to the root directory, required if 
//   the "arch_chroot" option is activated.   
// * `cache` (boolean)   
//   Cache service information.   
// * `name` (string)   
//   Service name, required.   
// * `startup` (boolean|string)
//   Run service daemon on startup, required. A string represent a list of activated
//   levels, for example '2345' or 'multi-user'.   
//   An empty string to not define any run level.   
//   Note: String argument is only used if SysVinit runlevel is installed on 
//   the OS (automatically detected by nikita).   

// ## Callback parameters

// * `err`   
//   Error object if any.   
// * `status`   
//   Indicates if the startup behavior has changed.   

// ## Example

// ```js
// require('nikita')
// .service.startup([{
//   ssh: ssh,
//   name: 'gmetad',
//   startup: false
// }, function(err, modified){ /* do sth */ });
// ```

// ## Source Code
module.exports = function({metadata, options}) {
  this.log({
    message: "Entering service.startup",
    level: 'DEBUG',
    module: 'nikita/lib/service/startup'
  });
  if (typeof metadata.argument === 'string') {
    // Options
    if (options.name == null) {
      options.name = metadata.argument;
    }
  }
  if (options.startup == null) {
    options.startup = true;
  }
  if (Array.isArray(options.startup)) {
    options.startup = [options.startup];
  }
  if (options.name == null) {
    // Validation
    throw Error(`Invalid Name: ${JSON.stringify(options.name)}`);
  }
  // Action
  this.log({
    message: `Startup service ${options.name}`,
    level: 'INFO',
    module: 'nikita/lib/service/startup'
  });
  this.system.execute({
    unless: options.cmd,
    cmd: "if command -v systemctl >/dev/null 2>&1; then\n  echo 'systemctl'\nelif command -v chkconfig >/dev/null 2>&1; then\n  echo 'chkconfig'\nelif command -v update-rc.d >/dev/null 2>&1; then\n  echo 'update-rc'\nelse\n  echo \"Unsupported Loader\" >&2\n  exit 2\nfi",
    shy: true
  }, function(err, {stdout}) {
    var ref;
    if (err) {
      throw err;
    }
    options.cmd = stdout.trim();
    if ((ref = options.cmd) !== 'systemctl' && ref !== 'chkconfig' && ref !== 'update-rc') {
      throw Error("Unsupported Loader");
    }
  });
  this.system.execute({
    if: function() {
      return options.cmd === 'systemctl';
    },
    cmd: `startup=${(options.startup ? '1' : '')}\nif systemctl is-enabled ${options.name}; then\n  [ -z "$startup" ] || exit 3\n  echo 'Disable ${options.name}'\n  systemctl disable ${options.name}\nelse\n  [ -z "$startup" ] && exit 3\n  echo 'Enable ${options.name}'\n  systemctl enable ${options.name}\nfi`,
    trap: true,
    code_skipped: 3,
    arch_chroot: options.arch_chroot,
    rootdir: options.rootdir
  }, function(err, {status}) {
    var message;
    if (err && options.startup) {
      err = Error(`Startup Enable Failed: ${options.name}`);
    }
    if (err && !options.startup) {
      err = Error(`Startup Disable Failed: ${options.name}`);
    }
    if (err) {
      throw err;
    }
    message = options.startup ? 'activated' : 'disabled';
    return this.log(status ? {
      message: `Service startup updated: ${message}`,
      level: 'WARN',
      module: 'nikita/lib/service/remove'
    } : {
      message: `Service startup not modified: ${message}`,
      level: 'INFO',
      module: 'nikita/lib/service/remove'
    });
  });
  this.call({
    if: function() {
      return options.cmd === 'chkconfig';
    }
  }, function(_, callback) {
    return this.system.execute({
      if: function() {
        return options.cmd === 'chkconfig';
      },
      cmd: `chkconfig --list ${options.name}`,
      code_skipped: 1
    }, function(err, {status, stdout, stderr}) {
      var c, current_startup, j, len, level, ref;
      if (err) {
        return callback(err);
      }
      // Invalid service name return code is 0 and message in stderr start by error
      if (/^error/.test(stderr)) {
        this.log({
          message: `Invalid chkconfig name for "${options.name}"`,
          level: 'ERROR',
          module: 'mecano/lib/service/startup'
        });
        throw Error(`Invalid chkconfig name for \`${options.name}\``);
      }
      current_startup = '';
      if (status) {
        ref = stdout.split(' ').pop().trim().split('\t');
        for (j = 0, len = ref.length; j < len; j++) {
          c = ref[j];
          [level, status] = c.split(':');
          if (['on', 'marche'].indexOf(status) > -1) {
            current_startup += level;
          }
        }
      }
      if (options.startup === true && current_startup.length) {
        return callback();
      }
      if (options.startup === current_startup) {
        return callback();
      }
      if (status && options.startup === false && current_startup === '') {
        return callback();
      }
      this.call({
        if: options.startup
      }, function() {
        var cmd, i, k, startup_off, startup_on;
        cmd = `chkconfig --add ${options.name};`;
        if (typeof options.startup === 'string') {
          startup_on = startup_off = '';
          for (i = k = 0; k < 6; i = ++k) {
            if (options.startup.indexOf(i) !== -1) {
              startup_on += i;
            } else {
              startup_off += i;
            }
          }
          if (startup_on) {
            cmd += `chkconfig --level ${startup_on} ${options.name} on;`;
          }
          if (startup_off) {
            cmd += `chkconfig --level ${startup_off} ${options.name} off;`;
          }
        } else {
          cmd += `chkconfig ${options.name} on;`;
        }
        return this.system.execute({
          cmd: cmd
        }, function(err) {
          return callback(err, true);
        });
      });
      return this.call({
        unless: options.startup
      }, function() {
        this.log({
          message: "Desactivating startup rules",
          level: 'DEBUG',
          module: 'mecano/lib/service/startup'
        });
        if (typeof this.log === "function") {
          this.log("Mecano `service.startup`: s");
        }
        // Setting the level to off. An alternative is to delete it: `chkconfig --del #{options.name}`
        return this.system.execute({
          cmd: `chkconfig ${options.name} off`
        }, function(err) {
          return callback(err, true);
        });
      });
    });
  }, function(err, status) {
    var message;
    if (err) {
      throw err;
    }
    message = options.startup ? 'activated' : 'disabled';
    return this.log(status ? {
      message: `Service startup updated: ${message}`,
      level: 'WARN',
      module: 'nikita/lib/service/startup'
    } : {
      message: `Service startup not modified: ${message}`,
      level: 'INFO',
      module: 'nikita/lib/service/startup'
    });
  });
  return this.system.execute({
    if: function() {
      return options.cmd === 'update-rc';
    },
    cmd: `startup=${(options.startup ? '1' : '')}\nif ls /etc/rc*.d/S??${options.name}; then\n  [ -z "$startup" ] || exit 3\n  echo 'Disable ${options.name}'\n  update-rc.d -f ${options.name} disable\nelse\n  [ -z "$startup" ] && exit 3\n  echo 'Enable ${options.name}'\n  update-rc.d -f ${options.name} enable\nfi`,
    code_skipped: 3,
    arch_chroot: options.arch_chroot,
    rootdir: options.rootdir
  }, function(err, {status}) {
    var message;
    if (err) {
      throw err;
    }
    message = options.startup ? 'activated' : 'disabled';
    return this.log(status ? {
      message: `Service startup updated: ${message}`,
      level: 'WARN',
      module: 'nikita/lib/service/remove'
    } : {
      message: `Service startup not modified: ${message}`,
      level: 'INFO',
      module: 'nikita/lib/service/remove'
    });
  });
};
