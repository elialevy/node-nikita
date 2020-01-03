// Generated by CoffeeScript 2.4.1
// # `nikita.fs.rmdir`

// Delete a directory.

// * `target` (string)   
//   Final destination path.

// ## Source Code
module.exports = {
  status: false,
  log: false,
  handler: function({metadata, options}) {
    this.log({
      message: "Entering fs.rmdir",
      level: 'DEBUG',
      module: 'nikita/lib/fs/rmdir'
    });
    if (metadata.argument != null) {
      // Normalize options
      options.target = metadata.argument;
    }
    if (!options.target) {
      throw Error("Required Option: the \"target\" option is mandatory");
    }
    return this.system.execute({
      cmd: `[ ! -d '${options.target}' ] && exit 2\nrmdir '${options.target}'`,
      sudo: options.sudo,
      bash: options.bash,
      arch_chroot: options.arch_chroot
    }, function(err) {
      if ((err != null ? err.code : void 0) === 2) {
        err = Error(`ENOENT: no such file or directory, rmdir '${options.target}'`);
        err.errno = -2;
        err.code = 'ENOENT';
        err.syscall = 'rmdir';
        err.path = `${options.target}`;
      }
      this.log(!err ? {
        message: "Directory successfully removed",
        level: 'INFO',
        module: 'nikita/lib/fs/write'
      } : {
        message: "Fail to remove directory",
        level: 'ERROR',
        module: 'nikita/lib/fs/write'
      });
      throw err;
    });
  }
};
