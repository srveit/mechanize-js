var History = require('../lib/mechanize/history');


describe('Mechanize/History', function () {
  var history;

  beforeEach(function () {
    history = new History();
  });

  it("should exist", function () {
    history.should.exist;
    //history.should.eql(2);
  });

});
