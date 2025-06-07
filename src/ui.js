export function getElements() {
    return {
        gameSetup: document.getElementById('game-setup'),
        container: document.getElementById('container'),
        winnerOverlay: document.getElementById('winner-overlay'),
        winnerName: document.getElementById('winner-name'),
        winnerBounces: document.getElementById('winner-bounces'),
        winnerLogoDisplay: document.getElementById('winner-logo-display'),
        gameStats: document.getElementById('game-stats'),
        playerInputsContainer: document.getElementById('player-inputs'),
        speedSlider: document.getElementById('speed-slider'),
        sizeSlider: document.getElementById('size-slider'),
        currentSpeed: document.getElementById('current-speed'),
        currentSize: document.getElementById('current-size'),
        buttons: {
            start: document.getElementById('start-btn'),
            addPlayer: document.getElementById('add-player-btn'),
            restart: document.getElementById('restart-btn'),
            stop: document.getElementById('stop-game-btn'),
            fullscreen: document.getElementById('fullscreen-btn'),
            soundToggle: document.getElementById('sound-toggle-btn')
        },
        bottomButtons: document.getElementById('bottom-action-buttons'),
        soundButtons: {
            main: document.getElementById('sound-toggle-btn'),
            setup: document.getElementById('sound-toggle-btn-setup')
        },
        soundIcons: {
            main: document.getElementById('sound-toggle-icon'),
            setup: document.getElementById('sound-toggle-icon-setup')
        },
        soundLabels: {
            main: document.getElementById('sound-toggle-label'),
            setup: document.getElementById('sound-toggle-label-setup')
        }
    };
}

export function bindSoundButtons(elements, audioManager) {
    Object.values(elements.soundButtons).forEach(btn => {
        if (btn) btn.addEventListener('click', () => audioManager.toggle());
    });
}
