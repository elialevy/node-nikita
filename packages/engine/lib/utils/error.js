// Generated by CoffeeScript 2.5.1
var NikitaError;

NikitaError = class NikitaError extends Error {
  constructor(code, message, ...contexts) {
    var context, i, key, len, value;
    if (Array.isArray(message)) {
      message = message.join(' ');
    }
    super(message);
    if (Error.captureStackTrace !== void 0) {
      Error.captureStackTrace(this, NikitaError);
    }
    this.code = code;
    for (context in contexts) {
      for (i = 0, len = context.length; i < len; i++) {
        key = context[i];
        value = context[key];
        this[key] = Buffer.isBuffer(value) ? value.toString() : value === null ? value : JSON.parse(JSON.stringify(value));
      }
    }
  }

};

module.exports = function() {
  return new NikitaError(...arguments);
};