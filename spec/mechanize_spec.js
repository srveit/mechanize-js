var mechanize = require('../lib/mechanize');

describe('Mechanize', function () {
  var agent;

  beforeEach(function () {
    agent = mechanize.newAgent();
  });

  it('shows asynchronous test', function () {
    setTimeout(function () {
      'second'.should.equal('second');
      asyncSpecDone();
    }, 1);
    'first'.should.equal('first');
    asyncSpecWait();
  });
});
