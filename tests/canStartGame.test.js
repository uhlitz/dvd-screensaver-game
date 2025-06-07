const { JSDOM } = require('jsdom');

describe('canStartGame', () => {
  let dom;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><input id="player1" /><input id="player2" />', { runScripts: 'dangerously' });
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

  test('returns false when less than two names are entered', () => {
    expect(DVDCornerChallenge.prototype.canStartGame()).toBe(false);
  });

  test('returns true when two names are entered', () => {
    document.getElementById('player1').value = 'Alice';
    document.getElementById('player2').value = 'Bob';
    expect(DVDCornerChallenge.prototype.canStartGame()).toBe(true);
  });
});
