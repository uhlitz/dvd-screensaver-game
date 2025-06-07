const { JSDOM } = require('jsdom');

describe('canStartGame', () => {
  let dom;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><input id="player1" />', { runScripts: 'dangerously' });
    global.window = dom.window;
    global.document = dom.window.document;
    jest.resetModules();
    require('../script.js');
  });

  afterEach(() => {
    dom.window.close();
    delete global.window;
    delete global.document;
  });

  test('returns false when the input is empty', () => {
    expect(DVDCornerChallenge.prototype.canStartGame()).toBe(false);
  });

  test('returns true when the input is populated', () => {
    document.getElementById('player1').value = 'Alice';
    expect(DVDCornerChallenge.prototype.canStartGame()).toBe(true);
  });
});
