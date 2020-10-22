// Generated by CoffeeScript 2.5.1
  // # `nikita.docker.build`

// Build docker repository from Dockerfile, from content or from current working
  // directory.

// The user can choose whether the build is local or on the remote.
  // Options are the same than docker build command with nikita's one.
  // Be aware than you can not use ADD with content option because docker build
  // from STDIN does not support a context.

// By default docker always run the build and overwrite existing repositories.
  // Status unmodified if the repository is identical to a previous one

// ## Callback parameters

// * `err`   
  //   Error object if any.   
  // * `status`   
  //   True if image was successfully built.   
  // * `image`   
  //   Image ID if the image was built, the ID is based on the image sha256 checksum.   
  // * `stdout`   
  //   Stdout value(s) unless `stdout` option is provided.   
  // * `stderr`   
  //   Stderr value(s) unless `stderr` option is provided.   

// ## Examples

// ### Builds a repository from dockerfile without any resourcess

// ```javascript
  // require('nikita')
  // .docker.build({
  //   image: 'ryba/targe-build',
  //   source: '/home/ryba/Dockerfile'
  // }, function(err, {status}){
  //   console.log( err ? err.message : 'Container built: ' + status);
  // });
  // ```

// ### Builds an repository from dockerfile with external resources

// In this case nikita download all the external files into a resources directory in the same location
  // than the Dockerfile. The Dockerfile content:

// ```dockerfile
  // FROM centos7
  // ADD resources/package.tar.gz /tmp/
  // ADD resources/configuration.sh /tmp/
  // ```

// Build directory tree :

// ```
  // ├── Dockerfile
  // ├── resources
  // │   ├── package.tar.gz
  // │   ├── configuration.sh
  // ```

// ```javascript
  // require('nikita')
  // .docker.build({
  //   tag: 'ryba/target-build',
  //   source: '/home/ryba/Dockerfile',
  //   resources: ['http://url.com/package.tar.gz/','/home/configuration.sh']
  // }, function(err, {status}){
  //   console.log( err ? err.message : 'Container built: ' + status);
  // });
  // ```

// ### Builds an repository from stdin

// ```javascript
  // require('nikita')
  // .docker.build({
  //   ssh: ssh,
  //   tag: 'ryba/target-build'
  //   content: "FROM ubuntu\nRUN echo 'helloworld'"
  // }, function(err, {status}){
  //   console.log( err ? err.message : 'Container built: ' + status);
  // });
  // ```

// ## Hooks
var error, errors, handler, on_action, path, schema, util, utils,
  indexOf = [].indexOf;

on_action = function({config}) {
  if ((config.content != null) && (config.file != null)) {
    throw errors.NIKITA_DOCKER_BUILD_CONTENT_FILE_REQUIRED();
  }
};

// ## Schema
schema = {
  type: 'object',
  properties: {
    'build_arg': {
      oneOf: [
        {
          type: 'string'
        },
        {
          type: 'object',
          patternProperties: {
            '.*': {
              typeof: 'string'
            }
          }
        }
      ],
      description: `Send arguments to the build, match the Docker native ARG command.`
    },
    'content': {
      type: 'string',
      description: `Content of the Docker file, required unless \`file\` is provided.`
    },
    'cwd': {
      type: 'string',
      description: `Change the build working directory.`
    },
    'docker': {
      type: 'object',
      description: `Isolate all the parent configuration properties into a docker
property, used when providing and cascading a docker configuration at
a global scale.`
    },
    'file': {
      type: 'string',
      description: `Path to Dockerfile, required unless \`content\` is provided.`
    },
    'force_rm': {
      type: 'boolean',
      default: false,
      description: `Always remove intermediate containers during build.`
    },
    'image': {
      type: 'string',
      description: `Name of the Docker image present in the registry.`
    },
    'quiet': {
      type: 'boolean',
      default: false,
      description: `Suppress the verbose output generated by the containers.`
    },
    'rm': {
      type: 'boolean',
      default: true,
      description: `Remove intermediate containers after a successful build.`
    },
    'no_cache': {
      type: 'boolean',
      default: false,
      description: `Do not use cache when building the repository.`
    },
    'tag': {
      type: 'string',
      description: `Tag of the Docker image, default to latest.`
    },
    'boot2docker': {
      $ref: 'module://@nikitajs/docker/src/tools/execute#/properties/boot2docker'
    },
    'compose': {
      $ref: 'module://@nikitajs/docker/src/tools/execute#/properties/compose'
    },
    'machine': {
      $ref: 'module://@nikitajs/docker/src/tools/execute#/properties/machine'
    }
  },
  required: ['image']
};

// ## Handler
handler = async function({
    config,
    log,
    tools: {find}
  }) {
  var cmd, dockerfile_cmds, i, image_id, j, k, l, len, len1, len2, len3, line, lines, m, number_of_cache, number_of_step, opt, ref, ref1, ref2, ref3, ref4, ref5, source, stderr, stdout, userargs;
  log({
    message: "Entering Docker build",
    level: 'DEBUG',
    module: 'nikita/lib/docker/build'
  });
  number_of_step = 0;
  userargs = [];
  // status unmodified if final tag already exists
  dockerfile_cmds = ['CMD', 'LABEL', 'EXPOSE', 'ENV', 'ADD', 'COPY', 'ENTRYPOINT', 'VOLUME', 'USER', 'WORKDIR', 'ARG', 'ONBUILD', 'RUN', 'STOPSIGNAL', 'MAINTAINER'];
  source = void 0;
  if (config.file) {
    source = config.file;
  } else if (config.cwd) {
    source = `${config.cwd}/Dockerfile`;
  }
  if (config.file) {
    if (config.cwd == null) {
      config.cwd = path.dirname(config.file);
    }
  }
  // Build cmd
  cmd = 'build';
  ref = ['force_rm', 'quiet', 'no_cache'];
  for (i = 0, len = ref.length; i < len; i++) {
    opt = ref[i];
    if (config[opt]) {
      cmd += ` --${opt.replace('_', '-')}`;
    }
  }
  ref1 = ['build_arg'];
  for (j = 0, len1 = ref1.length; j < len1; j++) {
    opt = ref1[j];
    if (config[opt] != null) {
      if (Array.isArray(config[opt])) {
        ref2 = config[opt];
        for (l = 0, len2 = ref2.length; l < len2; l++) {
          k = ref2[l];
          cmd += ` --${opt.replace('_', '-')} ${k}`;
        }
      } else {
        cmd += ` --${opt.replace('_', '-')} ${config[opt]}`;
      }
    }
  }
  cmd += ` --rm=${config.rm ? 'true' : 'false'}`;
  cmd += ` -t \"${config.image}${config.tag ? `:${config.tag}` : ''}\"`;
  if (config.cwd) {
    // custom command for content option0
    if (config.file == null) {
      config.file = path.resolve(config.cwd, 'Dockerfile');
    }
  }
  if (config.content != null) {
    log({
      message: "Building from text: Docker won't have a context. ADD/COPY not working",
      level: 'WARN',
      module: 'nikita/docker/build'
    });
    if (config.content != null) {
      cmd += ` - <<DOCKERFILE\n${config.content}\nDOCKERFILE`;
    }
  } else if (config.file != null) {
    log({
      message: `Building from Dockerfile: \"${config.file}\"`,
      level: 'INFO',
      module: 'nikita/docker/build'
    });
    cmd += ` -f ${config.file} ${config.cwd}`;
  } else {
    log({
      message: "Building from CWD",
      level: 'INFO',
      module: 'nikita/docker/build'
    });
    cmd += ' .';
  }
  await this.file({
    if: config.content,
    content: config.content,
    source: source,
    target: function({content}) {
      return config.content = content;
    },
    from: config.from,
    to: config.to,
    match: config.match,
    replace: config.replace,
    append: config.append,
    before: config.before,
    write: config.write
  });
  // Read Dockerfile if necessary to count steps
  if (!config.content) {
    log({
      message: `Reading Dockerfile from : ${config.file}`,
      level: 'INFO',
      module: 'nikita/lib/build'
    });
    ({
      data: config.content
    } = (await this.fs.base.readFile({
      ssh: config.ssh,
      target: config.file,
      encoding: 'utf8'
    })));
  }
  ref3 = utils.string.lines(config.content);
  // Count steps
  for (m = 0, len3 = ref3.length; m < len3; m++) {
    line = ref3[m];
    if (ref4 = (ref5 = /^(.*?)\s/.exec(line)) != null ? ref5[1] : void 0, indexOf.call(dockerfile_cmds, ref4) >= 0) {
      number_of_step++;
    }
  }
  ({stdout, stderr} = (await this.docker.tools.execute({
    cmd: cmd,
    cwd: config.cwd
  })));
  image_id = null;
  // Count cache
  lines = utils.string.lines(stdout);
  number_of_cache = 0;
  for (k in lines) {
    line = lines[k];
    if (line.indexOf('Using cache') !== -1) {
      number_of_cache = number_of_cache + 1;
    }
    if (line.indexOf('Successfully built') !== -1) {
      image_id = line.split(' ').pop().toString();
    }
  }
  userargs = {
    status: number_of_step !== number_of_cache,
    image: image_id,
    stdout: stdout,
    stderr: stderr
  };
  log(userargs.status ? {
    message: `New image id ${userargs[1]}`,
    level: 'INFO',
    module: 'nikita/lib/docker/build'
  } : {
    message: `Identical image id ${userargs[1]}`,
    level: 'INFO',
    module: 'nikita/lib/docker/build'
  });
  return userargs;
};

// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    global: 'docker'
  },
  hooks: {
    on_action: on_action
  },
  schema: schema
};

// ## Errors
errors = {
  NIKITA_DOCKER_BUILD_CONTENT_FILE_REQUIRED: function() {
    return error('NIKITA_DOCKER_BUILD_CONTENT_FILE_REQUIRED', ['could not build the container,', 'one of the `content` or `file` config property must be provided']);
  }
};

// ## Dependencies
utils = require('@nikitajs/engine/src/utils');

error = require('@nikitajs/engine/src/utils/error');

path = require('path');

util = require('util');
