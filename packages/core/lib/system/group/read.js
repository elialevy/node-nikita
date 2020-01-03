// Generated by CoffeeScript 2.4.1
// # `nikita.system.group.read`

// Read and parse the group definition file located in "/etc/group".

// ## Options

// * `cache` (boolean)   
//   Cache the result inside the store.
// * `target` (string)   
//   Path to the group definition file, default to "/etc/group".
// * `gid` (string|integer)   
//   Retrieve the information for a specific group name or guid.

// ## Output parameters

// * `groups`   
//   An object where keys are the group names and values are the groups properties.
//   See the parameter `group` for a list of available properties.
// * `group`
//   Properties associated witht the group, only if the input parameter `gid` is
//   provided. Available properties are:   
//   * `group` (string)   
//   Name of the group.
//   * `password` (string)   
//   Group password as a result of the `crypt` function, rarely used.
//   * `gid` (string)   
//   The numerical equivalent of the group name. It is used by the operating
//   system and applications when determining access privileges.
//   * `users` (array[string])   
//   List of users who are members of this group.

// ## Examples

// Retrieve all groups informations:

// ```js
// require('nikita')
// .system.group.read(function(err, {groups}){
//   assert(Array.isArray(groups), true)
// })
// ```

// Retrieve information of an individual group:

// ```js
// require('nikita')
// .system.group.read({
//   gid: 0
// }, function(err, {group}){
//   assert(group.gid, 0)
//   assert(group.group, 'root')
// })
// ```

// ## Source Code
var string;

module.exports = {
  shy: true,
  handler: function({metadata, options}, callback) {
    var groups;
    this.log({
      message: "Entering system.group.read",
      level: 'DEBUG',
      module: 'nikita/lib/system/group/read'
    });
    if (options.target == null) {
      options.target = '/etc/group';
    }
    // Retrieve groups from cache
    groups = null;
    this.call({
      if: options.cache && !!this.store['nikita:etc_group']
    }, function() {
      this.log({
        message: "Get group definition from cache",
        level: 'INFO',
        module: 'nikita/lib/system/group/read'
      });
      return groups = this.store['nikita:etc_group'];
    });
    // Read system groups and place in cache if requested
    this.fs.readFile({
      unless: options.cache && !!this.store['nikita:etc_group'],
      target: options.target,
      encoding: 'ascii',
      log: metadata.log
    }, function(err, {data}) {
      var i, len, line, ref;
      if (err) {
        throw err;
      }
      if (data == null) {
        return;
      }
      groups = {};
      ref = string.lines(data);
      for (i = 0, len = ref.length; i < len; i++) {
        line = ref[i];
        line = /(.*)\:(.*)\:(.*)\:(.*)/.exec(line);
        if (!line) {
          continue;
        }
        groups[line[1]] = {
          group: line[1],
          password: line[2],
          gid: parseInt(line[3]),
          users: line[4] ? line[4].split(',') : []
        };
      }
      if (options.cache) {
        return this.store['nikita:etc_group'] = groups;
      }
    });
    // Pass the group information
    return this.next(function(err) {
      var group;
      if (err) {
        return callback(err);
      }
      if (!options.gid) {
        return callback(null, {
          status: true,
          groups: groups
        });
      }
      if (groups[options.gid] != null) {
        return callback(null, {
          status: true,
          group: groups[options.gid]
        });
      }
      if (typeof options.gid === 'string' && /\d+/.test(options.gid)) {
        options.gid = parseInt(options.gid, 10);
      }
      group = Object.values(groups).filter(function(group) {
        return group.gid === options.gid;
      })[0];
      if (!group) {
        return callback(Error(`Invalid Option: no gid matching ${JSON.stringify(options.gid)}`));
      }
      return callback(null, {
        status: true,
        group: group
      });
    });
  }
};


// ## Dependencies
string = require('@nikitajs/core/lib/misc/string');
