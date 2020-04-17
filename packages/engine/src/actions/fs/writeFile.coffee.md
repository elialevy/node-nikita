
# `nikita.fs.writeFile`

Write a Buffer or a string to a file. This action mimic the behavior of the
Node.js native [`fs.writeFile`](https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback)
function.

Internally, it uses the `nikita.fs.createWriteStream` from which it inherits all
the configuration properties.

## Example

```
require('nikita')
.fs.writeFile({
  target: "#{scratch}/a_file",
  content: 'Some data, a string or a Buffer'
})
```

## Hook

    on_action = ({config, metadata}) ->
      config.target = metadata.argument if metadata.argument?

## Schema

    schema =
      type: 'object'
      properties:
        'content':
          oneOf: [{type: 'string'}, 'instanceof': 'Buffer']
          description: """
          Content to write.
          """
        'cwd':
          type: 'string'
          description: """
          Current working directory used to resolve a relative target path.
          """
        'flags':
          type: 'string'
          default: 'w'
          description: """
          File system flag as defined in the [Node.js
          documentation](https://nodejs.org/api/fs.html#fs_file_system_flags)
          and [open(2)](http://man7.org/linux/man-pages/man2/open.2.html)
          """
        'target_tmp':
          type: 'string'
          description: """
          Location where to write the temporary uploaded file before it is
          copied into its final destination, default to
          "{tmpdir}/nikita_{YYMMDD}_{pid}_{rand}/{hash target}"
          """
        'mode':
          oneOf: [{type: 'integer'}, {type: 'string'}]
          default: 0o644
          description: """
          Permission mode, a bit-field describing the file type and mode.
          """
        'target':
          oneOf: [{type: 'string'}, 'instanceof': 'Buffer']
          description: """
          Final destination path.
          """
      required: ['content', 'target']

## Handler

    handler = ({config, metadata, ssh}) ->
      @log message: "Entering fs.writeFile", level: 'DEBUG', module: 'nikita/lib/fs/writeFile'
      p = if ssh then path.posix else path
      # Normalization
      config.target = if config.cwd then p.resolve config.cwd, config.target else p.normalize config.target
      throw Error "Non Absolute Path: target is #{JSON.stringify config.target}, SSH requires absolute paths, you must provide an absolute path in the target or the cwd option" if ssh and not p.isAbsolute config.target
      # Real work
      @fs.createWriteStream
        target: config.target
        flags: config.flags
        mode: config.mode
        stream: (ws) ->
          ws.write config.content
          ws.end()

## Exports

    module.exports =
      handler: handler
      metadata:
        status: false
        log: false
      schema: schema

## Dependencies

    path = require 'path'