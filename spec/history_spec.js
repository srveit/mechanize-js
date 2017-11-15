var History = require('../lib/mechanize/history');


describe('Mechanize/History', function () {
  var history;

  beforeEach(function () {
    history = new History();
  });

  it('should exist', function () {
    expect(history).not.toBe(undefined);
    //expect(history).toEqual(2);
  });

});
