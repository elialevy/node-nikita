
nikita = require '../../src'
args_to_actions = require '../../src/engine/args_to_actions'
registry = require '../../src/registry'
{tags, ssh, scratch} = require '../test'
they = require('ssh2-they').configure ssh...

return unless tags.posix

describe 'engine.args_to_actions', ->

  it 'internal.options', ->
    action_global = registry: registry.registry {}
    args_to_actions action_global, [
      [{key_1_1: '1.1'}, {key_1_2: '1.2'}]
      [{key_2_1: '2.1'}, {key_2_2: '2.2'}]
    ] , 'call'
    .map((action) ->
      (action.handler is undefined).should.be.a.true()
      action.action.should.eql ['call']
      action
    )
    .map((action) ->
      filter = {}
      for k, v of action
        filter[k] = v if /^key_/.test k
      filter
    ).should.eql [
      { key_1_1: '1.1', key_2_1: '2.1' }
      { key_1_2: '1.2', key_2_1: '2.1' }
      { key_1_1: '1.1', key_2_2: '2.2' },
      { key_1_2: '1.2', key_2_2: '2.2' }
    ]

  it 'interpret function as handler', ->
    action_global = registry: registry.registry {}
    args_to_actions action_global, [
      [{key_1_1: '1.1'}, {key_1_2: '1.2'}]
      [{key_2_1: '2.1'}, {key_2_2: '2.2'}]
      (->)
    ] , 'call'
    .map((action) ->
      action.handler.should.be.a.Function()
      action
    )
    .map((action) ->
      filter = {}
      for k, v of action
        filter[k] = v if /^key_/.test k
      filter
    )
    .should.eql [
      { key_1_1: '1.1', key_2_1: '2.1' }
      { key_1_2: '1.2', key_2_1: '2.1' }
      { key_1_1: '1.1', key_2_2: '2.2' },
      { key_1_2: '1.2', key_2_2: '2.2' }
    ]

  it 'interpret strings as a module exporting a function', (next) ->
    nikita
    .file
      target: "#{scratch}/a_module.js"
      content: '''
      module.exports = function(){
        return 'ok';
      }
      '''
    .call ->
      action_global = registry: registry.registry {}
      args_to_actions action_global,  [
        [{key: '1.1'}, {key: '1.2'}]
        "#{scratch}/a_module"
      ] , 'call'
      .map((action) ->
        action.handler().should.eql 'ok'
        action
      )
      .map((action) -> action.key )
      .should.eql [ '1.1', '1.2' ]
    .next next

  it 'overwrite module exported handler and user provided handler', (next) ->
    nikita
    .file
      target: "#{scratch}/module_exported_handler_and_user_provided_handler.js"
      content: '''
      module.exports = function(){
        return 'module';
      }
      '''
    .call ->
      action_global = registry: registry.registry {}
      args_to_actions action_global,  [
        [{key: '1.1'}, {key: '1.2'}]
        (-> 'user')
        "#{scratch}/module_exported_handler_and_user_provided_handler"
      ] , 'call'
      .map((action) ->
        action.handler().should.eql 'module'
        action.callback().should.eql 'user'
        action
      )
      .map((action) -> action.key )
      .should.eql [ '1.1', '1.2' ]
    .call ->
      action_global = registry: registry.registry {}
      args_to_actions action_global,  [
        [{key: '1.1'}, {key: '1.2'}]
        "#{scratch}/module_exported_handler_and_user_provided_handler"
        (-> 'user')
      ] , 'call'
      .map((action) ->
        action.handler().should.eql 'module'
        action.callback().should.eql 'user'
        action
      )
      .map((action) -> action.key )
      .should.eql [ '1.1', '1.2' ]
    .next next
