import Game from './game.js';

window.addEventListener('load', () => {
    const p1 = document.getElementById('player1');
    if (p1) {
        p1.value = 'VIDEO';
    }
    const game = new Game();
    if (p1) {
        game.updatePreviewLogo(1, p1.value.trim());
        p1.focus();
        const len = p1.value.length;
        try {
            p1.setSelectionRange(len, len);
        } catch {}
    }
});
