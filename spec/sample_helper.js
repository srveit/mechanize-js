/*global fixture: true, context: true
*/
function formatException(e) {
  var lineNumber, file, message;

  if (e.line) {
    lineNumber = e.line;
  } else if (e.lineNumber) {
    lineNumber = e.lineNumber;
  }

  if (e.sourceURL) {
    file = e.sourceURL;
  } else if (e.fileName) {
    file = e.fileName;
  }

  message = (e.name && e.message) ? (e.name + ': ' + e.message) : e.toString();
  if (e.stack) {
    message = e.stack;
  }

  if (file && lineNumber) {
    message += ' in ' + file + ' (line ' + lineNumber + ')';
  }

  return message;
}

(function () {
  var should, jasmine, fs;
  should = require('should');
  jasmine = require('jasmine-node');
  fs = require('fs');
  jasmine.util.formatException = formatException;
  fixture = function (filename) {
    return fs.readFileSync(__dirname + '/fixtures/' + filename, 'utf8');
  };
  context = describe;
  should.Assertion.prototype.assert = function (expr, msg, negatedMsg) {
    var msg1, ok;
    msg1 = this.negate ? negatedMsg : msg;
    ok = this.negate ? !expr : expr;
    jasmine.getEnv().currentSpec.addMatcherResult({
      passed: function () {
        return ok;
      },
      trace: ok ? '' : new Error(msg1)
    });
  };
}());
