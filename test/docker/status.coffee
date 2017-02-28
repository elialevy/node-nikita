# Be aware to specify the machine if docker mahcine is used
# Some other docker test uses docker.status (start, stop)
# So docker.status should is used by other docker command
# For this purpos ip, and clean are used

stream = require 'stream'
should = require 'should'
mecano = require '../../src'
test = require '../test'
they = require 'ssh2-they'
docker = require '../../src/misc/docker'


describe 'docker.status', ->

  scratch = test.scratch @
  config = test.config()
  return if config.disable_docker

  they 'on stopped  container', (ssh, next) ->
    mecano
      ssh: ssh
      docker: config.docker
    .docker.rm
      container: 'mecano_status'
      force: true
    .docker.run
      cmd: "/bin/echo 'test'"
      image: 'alpine'
      rm: false
      name: 'mecano_status'
    .docker.status
      container: 'mecano_status'
    , (err, running, stdout, stderr) ->
      running.should.be.false() unless err
    .docker.rm
      container: 'mecano_status'
      force: true
    .then next

  they 'on running container', (ssh, next) ->
    mecano
      ssh: ssh
      docker: config.docker
    .docker.rm
      container: 'mecano_status'
      force: true
    .docker.service
      image: 'httpd'
      port: [ '500:80' ]
      name: 'mecano_status'
    .docker.status
      container: 'mecano_status'
    , (err, running, stdout, stderr) ->
      running.should.be.true()
    .docker.rm
      container: 'mecano_status'
      force: true
    .then next
