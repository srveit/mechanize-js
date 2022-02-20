'use strict';
const {newHistory} = require('../lib/mechanize/history');

describe('Mechanize/History', () => {
  let history;

  beforeEach(() => {
    history = newHistory();
  });

  it('should exist', () => {
    expect(history).toEqual(expect.objectContaining({
      push: expect.any(Function),
      currentPage: expect.any(Function)
    }));
  });

});
