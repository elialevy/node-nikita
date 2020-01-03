// Generated by CoffeeScript 2.4.1
// # `nikita.system.user.read`

// Read and parse the passwd definition file located in "/etc/passwd".

// ## Options

// * `cache` (boolean, `false`, optional)   
//   Cache the result inside the store.
// * `target` (string, optional)   
//   Path to the passwd definition file,use the `getent passwd` by default which
//   use to "/etc/passwd".
// * `uid` (string|integer)   
//   Retrieve the information for a specific user name or uid.

// ## Output parameters

// * `users`   
//   An object where keys are the usernames and values are the user properties.
//   See the parameter `user` for a list of available properties.
// * `user`
//   Properties associated witht the user, only if the input parameter `uid` is
//   provided. Available properties are:   
//   * `user` (string)   
//   Username.
//   * `uid` (integer)   
//   User Id.
//   * `comment` (string)   
//   User description
//   * `home` (string)   
//   User home directory.
//   * `shell` (string)   
//   Default user shell command.

// ## Example

// ```js
// nikita
// .file({
//   target: "/tmp/etc/passwd",
//   content: "root:x:0:0:root:/root:/bin/bash"
// })
// .system.user.read({
//   target: "/tmp/etc/passwd"
// }, function (err, {status, users}){
//   if(err) throw err;
//   assert(status, false)
//   assert(users, {
//     "root": { user: 'root', uid: 0, gid: 0, comment: 'root', home: '/root', shell: '/bin/bash' }
//   })
// });
// ```

// ## implementation

// The default implementation use the `getent passwd` command. It is possible to
// read an alternative `/etc/passwd` file by setting the `target` option to the
// targeted file.

// ## Source Code
var string;

module.exports = {
  shy: true,
  handler: function({metadata, options}, callback) {
    var passwd, ref, str2passwd;
    this.log({
      message: "Entering system.user.read",
      level: 'DEBUG',
      module: 'nikita/lib/system/user/read'
    });
    if (options.uid && ((ref = !typeof options.uid) === 'string' || ref === 'number')) {
      throw Error('Invalid Option: uid must be a string or a number');
    }
    if (typeof options.uid === 'string' && /\d+/.test(options.uid)) {
      options.uid = parseInt(options.uid, 10);
    }
    // Retrieve passwd from cache
    passwd = null;
    this.call({
      if: options.cache && !!this.store['nikita:etc_passwd']
    }, function() {
      this.log({
        message: "Get passwd definition from cache",
        level: 'INFO',
        module: 'nikita/lib/system/user/read'
      });
      return passwd = this.store['nikita:etc_passwd'];
    });
    // Read system passwd and place in cache if requested
    str2passwd = function(data) {
      var i, len, line, ref1;
      passwd = {};
      ref1 = string.lines(data);
      for (i = 0, len = ref1.length; i < len; i++) {
        line = ref1[i];
        line = /(.*)\:\w\:(.*)\:(.*)\:(.*)\:(.*)\:(.*)/.exec(line);
        if (!line) {
          continue;
        }
        passwd[line[1]] = {
          user: line[1],
          uid: parseInt(line[2]),
          gid: parseInt(line[3]),
          comment: line[4],
          home: line[5],
          shell: line[6]
        };
      }
      return passwd;
    };
    if (!options.target) {
      this.system.execute({
        cmd: 'getent passwd'
      }, function(err, {stdout}) {
        if (err) {
          throw err;
        }
        passwd = str2passwd(stdout);
        if (options.cache) {
          return this.store['nikita:etc_passwd'] = passwd;
        }
      });
    } else {
      this.fs.readFile({
        unless: options.cache && !!this.store['nikita:etc_passwd'],
        target: options.target,
        encoding: 'ascii',
        log: metadata.log
      }, function(err, {data}) {
        if (err) {
          throw err;
        }
        if (data == null) {
          return;
        }
        passwd = str2passwd(data);
        if (options.cache) {
          return this.store['nikita:etc_passwd'] = passwd;
        }
      });
    }
    // Pass the passwd information
    return this.next(function(err) {
      var user;
      if (err) {
        return callback(err);
      }
      if (!options.uid) {
        return callback(null, {
          status: true,
          users: passwd
        });
      }
      if (typeof options.uid === 'string') {
        user = passwd[options.uid];
        if (!user) {
          return callback(Error(`Invalid Option: no uid matching ${JSON.stringify(options.uid)}`));
        }
        return callback(null, {
          status: true,
          user: user
        });
      } else {
        user = Object.values(passwd).filter(function(user) {
          return user.uid === options.uid;
        })[0];
        if (!user) {
          return callback(Error(`Invalid Option: no uid matching ${JSON.stringify(options.uid)}`));
        }
        return callback(null, {
          status: true,
          user: user
        });
      }
    });
  }
};


// ## Dependencies
string = require('@nikitajs/core/lib/misc/string');
