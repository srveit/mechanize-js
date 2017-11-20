'use strict';
const {newHistory} = require('../lib/mechanize/history');

describe('Mechanize/History', function () {
  var history;

  beforeEach(function () {
    history = newHistory();
  });

  it('should exist', function () {
    expect(history).toEqual(jasmine.objectContaining({
      push: jasmine.any(Function),
      currentPage: jasmine.any(Function)
    }));
  });

});
