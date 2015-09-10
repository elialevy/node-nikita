
mecano = require '../../src'
test = require '../test'
fs = require 'fs'

describe 'api promise', ->

  scratch = test.scratch @

  describe 'object', ->

    it 'works', (next) ->
      mecano
      .write
        destination: "#{scratch}/file_1"
        content: 'abc'
      .write
        destination: "#{scratch}/file_1"
        content: 'def'
        append: true
      .then (err, changed) ->
        return next err if err
        fs.readFile "#{scratch}/file_1", 'utf8', (err, content) ->
          content.should.eql 'abcdef'
          next()

  describe 'function', ->

    it 'works', (next) ->
      mecano({})
      .write
        destination: "#{scratch}/file_1"
        content: 'abc'
      .write
        destination: "#{scratch}/file_1"
        content: 'def'
        append: true
      .then (err, changed) ->
        return next err if err
        fs.readFile "#{scratch}/file_1", 'utf8', (err, content) ->
          content.should.eql 'abcdef'
          next()

    it 'pass global options', (next) ->
      logs = []
      log = (msg) -> logs.push msg
      mecano log: log
      .write
        destination: "#{scratch}/file_1"
        content: 'abc'
      .write
        destination: "#{scratch}/file_1"
        content: 'def'
        append: true
      .then (err, changed) ->
        return next err if err
        logs.length.should.be.above 1
        next()

        





