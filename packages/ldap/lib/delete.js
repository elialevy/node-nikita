// Generated by CoffeeScript 2.5.1
// # `nikita.ldap.delete`

// Insert or modify an entry inside an OpenLDAP server.   

// ## Options

// * `dn` (string | array)   
//   One or multiple DN to remove.   
// * `uri`   
//   Specify URI referring to the ldap server.   
// * `binddn`   
//   Distinguished Name to bind to the LDAP directory.   
// * `passwd`   
//   Password for simple authentication.   
// * `name`   
//   Distinguish name storing the "olcAccess" property, using the database adress
//   (eg: "olcDatabase={2}bdb,cn=config").   
// * `overwrite`   
//   Overwrite existing "olcAccess", default is to merge.   

// ## Example

// ```js
// require('nikita')
// .ldap.delete({
//   url: 'ldap://openldap.server/',
//   binddn: 'cn=admin,cn=config',
//   passwd: 'password',
//   dn: 'cn=group1,ou=groups,dc=company,dc=com'
// }, function(err, {status}){
//   console.log(err ? err.message : 'Entry deleted: ' + status);
// });
// ```

// ## Source Code
module.exports = function({options}, callback) {
  var binddn, dn, passwd, uri;
  // Auth related options
  binddn = options.binddn ? `-D ${options.binddn}` : '';
  passwd = options.passwd ? `-w ${options.passwd}` : '';
  if (options.url) {
    console.log("Nikita: option 'options.url' is deprecated, use 'options.uri'");
    if (options.uri == null) {
      options.uri = options.url;
    }
  }
  if (options.uri === true) {
    options.uri = 'ldapi:///';
  }
  uri = options.uri ? `-H ${options.uri}` : ''; // URI is obtained from local openldap conf unless provided
  if (!options.dn) {
    // Add related options
    return callback(Error("Nikita `ldap.delete`: required property 'dn'"));
  }
  if (!Array.isArray(options.dn)) {
    options.dn = [options.dn];
  }
  dn = options.dn.map(function(dn) {
    return `'${dn}'`;
  }).join(' ');
  // ldapdelete -D cn=Manager,dc=ryba -w test -H ldaps://master3.ryba:636 'cn=nikita,ou=users,dc=ryba' 
  return this.system.execute({
    cmd: `ldapdelete ${binddn} ${passwd} ${uri} ${dn}`
  // code_skipped: 68
  }, function(err, data) {
    if (err) {
      return callback(err);
    }
    return callback(err, data.status);
  });
};

// modified = stderr.match(/Already exists/g)?.length isnt stdout.match(/adding new entry/g).length
// added = modified # For now, we dont modify
// callback err, modified, added
