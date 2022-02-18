'use strict';
const {newHistory} = require('../lib/mechanize/history');

describe('Mechanize/History', () => {
  let history;

  beforeEach(() => {
    history = newHistory();
  });

  it('should exist', () => {
    expect(history).toEqual(jasmine.objectContaining({
      push: jasmine.any(Function),
      currentPage: jasmine.any(Function)
    }));
  });

});
