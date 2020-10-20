
session = require '../session'

module.exports = ->
  module: '@nikitajs/engine/src/plugins/conditions_execute'
  require: [
    '@nikitajs/engine/src/plugins/conditions'
  ]
  hooks:
    'nikita:session:action':
      after: '@nikitajs/engine/src/plugins/conditions'
      before: '@nikitajs/engine/src/metadata/disabled'
      handler: (action) ->
        final_run = true
        for k, v of action.conditions
          continue unless handlers[k]?
          local_run = await handlers[k].call null, action
          final_run = false if local_run is false
        if not final_run
          action.metadata.disabled = true
        action

handlers =
  if_execute: (action, value) ->
    final_run = true
    for condition in action.conditions.if_execute
      await session null, ({run}) ->
        {status} = await run
          hooks:
            on_result: ({action}) -> delete action.parent
          metadata:
            condition: true
            depth: action.metadata.depth
          parent: action
          namespace: ['execute']
          code_skipped: 1
        , condition
        final_run = false unless status
    final_run
  unless_execute: (action) ->
    final_run = true
    for condition in action.conditions.unless_execute
      await session null, ({run}) ->
        {status} = await run
          hooks:
            on_result: ({action}) -> delete action.parent
          metadata:
            condition: true
            depth: action.metadata.depth
          parent: action
          namespace: ['execute']
          code_skipped: 1
        , condition
        final_run = false if status
    final_run