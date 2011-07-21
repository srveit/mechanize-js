/*global fixture: true, context: true
*/
(function () {
  var should = require('should'),
  jasmine = require('jasmine-node'),
  fs = require('fs');
  require.paths.unshift(__dirname + '/../node_modules/mechanize/lib');
  fixture = function (filename) {
    return fs.readFileSync(__dirname + '/fixtures/' + filename, 'utf8');
  };
  context = describe;
  should.Assertion.prototype.assert = function (expr, msg, negatedMsg) {
    var msg1 = this.negate ? negatedMsg : msg,
    ok = this.negate ? !expr : expr;
    jasmine.getEnv().currentSpec.addMatcherResult({
      passed: function () {
        return ok;
      },
      trace: ok ? '' : new Error(msg1)
    });
  };
}());
