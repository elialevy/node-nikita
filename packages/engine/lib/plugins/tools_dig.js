// Generated by CoffeeScript 2.5.1
/*
Plugin `dig`

The plugin export a `dig` function which is used to traverse all the executed
action prior to the current action.

It works similarly to `walk`. However, while `walk` only traverse the parent
hierarchy of actions, `dig` walk the all tree of actions. Like `walk`, it start
with the most recently executed action to the first executed action, the root
action.

*/
var dig_down, dig_up, utils, validate;

utils = require('../utils');

dig_down = async function(action, digger) {
  var child, i, j, len, len1, precious, ref, ref1, results, sibling;
  results = [];
  ref = action.children.reverse();
  for (i = 0, len = ref.length; i < len; i++) {
    child = ref[i];
    results.push(...((await dig_down(child, digger))));
  }
  if (action.siblings) {
    ref1 = action.siblings.reverse();
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      sibling = ref1[j];
      results.push(...((await dig_down(sibling, digger))));
    }
  }
  precious = (await digger(action));
  if (precious !== void 0) {
    results.push(precious);
  }
  return results;
};

dig_up = async function(action, digger) {
  var i, len, precious, ref, results, sibling;
  results = [];
  precious = (await digger(action));
  if (precious !== void 0) {
    results.push(precious);
  }
  // TODO, siblings shall never be undefined and always an empty array, isn't ?
  if (action.siblings) {
    ref = action.siblings.reverse();
    for (i = 0, len = ref.length; i < len; i++) {
      sibling = ref[i];
      results.push(...((await dig_down(sibling, digger))));
    }
  }
  if (action.parent) {
    results.push(...((await dig_up(action.parent, digger))));
  }
  return results;
};

validate = function(action, args) {
  var finder;
  if (args.length === 1) {
    [finder] = args;
  } else if (args.length === 2) {
    [action, finder] = args;
  } else {
    if (!action) {
      throw utils.error('TOOLS_DIG_INVALID_ARGUMENT', ['action signature is expected to be', '`finder` or `action, finder`', `got ${JSON.stringify(args)}`]);
    }
  }
  if (!action) {
    throw utils.error('TOOLS_DIG_ACTION_FINDER_REQUIRED', ['argument `action` is missing and must be a valid action']);
  }
  if (!finder) {
    throw utils.error('TOOLS_DIG_FINDER_REQUIRED', ['argument `finder` is missing and must be a function']);
  }
  if (typeof finder !== 'function') {
    throw utils.error('TOOLS_DIG_FINDER_INVALID', ['argument `finder` is missing and must be a function']);
  }
  return [action, finder];
};

module.exports = function(action) {
  return {
    module: '@nikitajs/engine/src/plugins/TOOLS_DIG',
    hooks: {
      'nikita:session:action': function(action) {
        // Register function
        if (action.tools == null) {
          action.tools = {};
        }
        return action.tools.dig = async function() {
          var finder;
          [action, finder] = validate(action, arguments);
          return (await dig_up(action, finder));
        };
      }
    }
  };
};
