
# `nikita.fs.createReadStream(options, callback)`

## Example

```js
buffers = []
nikita.fs.createReadStream({
  target: '/path/to/file'
  stream: function(rs){
    stream.on('readable', function(){
      while(buffer = rs.read()){
        buffers.push(buffer);
      }
    })
  }
}, function(err){
  console.log(err ? err.message : Buffer.concat(buffers).toString());
})
```

```js
buffers = []
nikita.fs.createReadStream({
  target: '/path/to/file'
  on_readable: function(rs){
    while(buffer = rs.read()){
      buffers.push(buffer);
    }
  }
}, function(err){
  console.log(err ? err.message : Buffer.concat(buffers).toString());
})
```

## Source Code

    module.exports = status: false, handler: (options, callback) ->
      options.log message: "Entering fs.createReadStream", level: 'DEBUG', module: 'nikita/lib/fs/createReadStream'
      ssh = @ssh options.ssh
      # Normalize options
      options.target = options.argument if options.argument?
      throw Error "Required Option: the \"target\" option is mandatory" unless options.target
      options.target_tmp ?= "/tmp/nikita_#{string.hash options.target}" if options.sudo
      content = null
      # Guess current username
      current_username =
        if ssh then ssh.config.username
        else if /^win/.test(process.platform) then process.env['USERPROFILE'].split(path.sep)[2]
        else process.env['USER']
      @call if: options.target_tmp, ->
        @system.execute
          sudo: options.sudo
          bash: options.bash
          arch_chroot: options.arch_chroot
          cmd: """
          [ ! -f '#{options.target}' ] && exit
          cp '#{options.target}' '#{options.target_tmp}'
          chown '#{current_username}' '#{options.target_tmp}'
          """
      , (err, status) ->
        options.log unless err
        then message: "Placing original file in temporary path before reading", level: 'INFO', module: 'nikita/lib/fs/createReadStream'
        else message: "Failed to place original file in temporary path", level: 'ERROR', module: 'nikita/lib/fs/createReadStream'
        callback err if err
      callback_args = null
      @call (_, callback) ->
        buffers = []
        options.log message: "Reading file #{options.target_tmp or options.target}", level: 'DEBUG', module: 'nikita/lib/fs/createReadStream'
        fs.createReadStream ssh, options.target_tmp or options.target, (err, rs) =>
          return callback err if err
          done = (err) ->
            callback_args = err
            callback()
          if options.on_readable
            rs.on 'readable', ->
              options.on_readable rs
          else
            options.stream rs
          rs.on 'error', done
          rs.on 'end', done
      @system.execute
        if: options.target_tmp
        sudo: options.sudo
        bash: options.bash
        arch_chroot: options.arch_chroot
        cmd: """
        rm '#{options.target_tmp}'
        """
      , (err) ->
        callback callback_args
    
        

## Dependencies

    fs = require 'ssh2-fs'
    string = require '../misc/string'