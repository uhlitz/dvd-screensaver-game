class DVDCornerChallenge {
            constructor() {
                // Discrete speed mapping
                this.KNOB_POSITIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
                this.SPEED_VALUES = [0.125, 0.25, 0.5, 1, 2, 4, 8, 16, 32, 64, 128];
                // Default knob position (matches an entry in KNOB_POSITIONS)
                this.DEFAULT_KNOB = 6;
                this.initializeElements();
                this.initializeGame();
                this.setupEventListeners();
                this.updateButtons();
                this.soundEnabled = false;
                this.syncSoundButtons();
            }
            
            initializeElements() {
                // Cache all DOM elements
                this.elements = {
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
                    bottomButtons: document.getElementById('bottom-action-buttons')
                };
                this.elements.soundButtons = {
                    main: document.getElementById('sound-toggle-btn'),
                    setup: document.getElementById('sound-toggle-btn-setup')
                };
                this.elements.soundIcons = {
                    main: document.getElementById('sound-toggle-icon'),
                    setup: document.getElementById('sound-toggle-icon-setup')
                };
                this.elements.soundLabels = {
                    main: document.getElementById('sound-toggle-label'),
                    setup: document.getElementById('sound-toggle-label-setup')
                };
            }
            
            initializeGame() {
                // Game state
                this.state = {
                    players: [],
                    previewLogos: [],
                    gameRunning: false,
                    gameStarted: false,
                    uiHidden: false,
                    winner: null,
                    currentPlayerCount: 3,
                    maxPlayers: 12
                };
                
                // Game configuration
                this.config = {
                    // Slider knob position (value from KNOB_POSITIONS)
                    speedKnob: this.DEFAULT_KNOB,
                    baseLogo: { width: 200, height: 88 },
                    baseLabelSize: 12,
                    sizeMultiplier: 3, // Default size (slider value 3)
                    logoWidth: 200,
                    logoHeight: 88,
                    labelFontSize: 12,
                    playerColors: [
                        '#00ffff', '#ff0080', '#00ff00', '#ffff00', 
                        '#ff4000', '#8000ff', '#ff0040', '#40ff00',
                        '#0080ff', '#ff8000', '#ff00ff', '#80ff00'
                    ]
                };
                
                // Initialize audio context
                this.initializeAudio();

                // Sync sliders with configured defaults
                this.elements.speedSlider.min = this.KNOB_POSITIONS[0];
                this.elements.speedSlider.max = this.KNOB_POSITIONS[this.KNOB_POSITIONS.length - 1];
                this.elements.speedSlider.value = this.config.speedKnob;

                this.updateSpeeds();
                this.updateSizes();
            }
            
            initializeAudio() {
                try {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                } catch (e) {
                    console.log('Web Audio API not supported');
                    this.audioContext = null;
                }
            }
            
            toggleSound() {
                this.soundEnabled = !this.soundEnabled;
                this.syncSoundButtons();
            }
            syncSoundButtons() {
                Object.entries(this.elements.soundButtons).forEach(([key, btn]) => {
                    if (!btn) return;
                    btn.setAttribute('aria-pressed', this.soundEnabled ? 'true' : 'false');
                });

                Object.entries(this.elements.soundIcons).forEach(([key, icon]) => {
                    if (!icon) return;
                    const cross = icon.querySelector('#sound-x') || icon.querySelector('#sound-x-setup');
                    if (cross) cross.style.display = this.soundEnabled ? 'none' : 'inline';
                });
            }

            knobToSpeed(k) {
                const index = this.KNOB_POSITIONS.indexOf(Number(k));
                const defaultIndex = this.KNOB_POSITIONS.indexOf(this.DEFAULT_KNOB);
                return index !== -1 ? this.SPEED_VALUES[index] : this.SPEED_VALUES[defaultIndex];
            }

           updateSpeedLabel() {
                this.elements.currentSpeed.textContent = this.config.speedKnob;
            }

            playBounceSound() {
                if (!this.audioContext || !this.soundEnabled) return;
                
                try {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    
                    // Create a quick "tuck" sound
                    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);
                    
                    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                    
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + 0.1);
                } catch (e) {
                    // Silently fail if audio doesn't work
                }
            }

            playWinnerJingle() {
                if (!this.audioContext || !this.soundEnabled) return;

                try {
                    // A quick arcade-style melody (C5 -> E5 -> G5 -> C6)
                    const notes = [523.25, 659.25, 783.99, 1046.5];
                    const noteDuration = 0.18;
                    const now = this.audioContext.currentTime;

                    notes.forEach((freq, idx) => {
                        const oscillator = this.audioContext.createOscillator();
                        const gainNode = this.audioContext.createGain();

                        oscillator.type = 'triangle';
                        oscillator.frequency.setValueAtTime(freq, now + idx * noteDuration);

                        oscillator.connect(gainNode);
                        gainNode.connect(this.audioContext.destination);

                        gainNode.gain.setValueAtTime(0.15, now + idx * noteDuration);
                        gainNode.gain.exponentialRampToValueAtTime(0.001, now + (idx + 1) * noteDuration);

                        oscillator.start(now + idx * noteDuration);
                        oscillator.stop(now + (idx + 1) * noteDuration);
                    });
                } catch (e) {
                    // Ignore audio errors
                }
            }
            
            setupEventListeners() {
                // Button event listeners
                this.elements.buttons.start.addEventListener('click', () => {
                    this.enableAudio();
                    this.startGame();
                });
                this.elements.buttons.addPlayer.addEventListener('click', () => this.addPlayer());
                this.elements.buttons.restart.addEventListener('click', () => this.restartGame());
                this.elements.buttons.stop.addEventListener('click', () => this.stopGame());
                this.elements.buttons.fullscreen.addEventListener('click', () => this.toggleFullscreen());
                
                Object.values(this.elements.soundButtons).forEach(btn => {
                    if (btn) btn.addEventListener('click', () => this.toggleSound());
                });
                
                // Speed slider event listener
                this.elements.speedSlider.addEventListener('input', (e) => {
                    this.config.speedKnob = parseInt(e.target.value);
                    this.updateSpeeds();
                    this.updatePreviewSpeeds();
                });
                
                // Size slider event listener
                this.elements.sizeSlider.addEventListener('input', (e) => {
                    this.config.sizeMultiplier = parseInt(e.target.value);
                    this.elements.currentSize.textContent = this.config.sizeMultiplier;
                    this.updateSizes();
                    this.updatePreviewSizes();
                });
                
                // Keyboard event listener for fullscreen
                document.addEventListener('keydown', (e) => {
                    const active = document.activeElement;
                    // ESC blurs input
                    if (e.key === 'Escape' && active && active.tagName === 'INPUT') {
                        active.blur();
                    }
                    // [F] for fullscreen if not in input
                    if ((e.key === 'f' || e.key === 'F') && (!active || active.tagName !== 'INPUT')) {
                        e.preventDefault();
                        this.toggleFullscreen();
                    }
                    // [S] toggles sound
                    if ((e.key === 's' || e.key === 'S') && (!active || active.tagName !== 'INPUT')) {
                        e.preventDefault();
                        this.toggleSound();
                    }
                    // [H] hide/show UI during gameplay
                    if ((e.key === 'h' || e.key === 'H') && (!active || active.tagName !== 'INPUT')) {
                        e.preventDefault();
                        this.toggleUIVisibility();
                    }
                    // ENTER triggers actions if not in input
                    if (e.key === 'Enter' && (!active || active.tagName !== 'INPUT')) {
                        // If winner screen is showing, treat ENTER as clicking "Play Again"
                        if (this.elements.winnerOverlay.classList.contains('show')) {
                            e.preventDefault();
                            this.restartGame();
                        } else if (!this.state.gameStarted && this.canStartGame()) {
                            this.startGame();
                        }
                    }
                });
                
                // Initial player input listeners
                this.setupPlayerEventListeners();
                
                // Window resize handler
                window.addEventListener('resize', () => {
                    if (this.state.gameRunning) {
                        this.restartGame();
                    }
                });
            }
            
            enableAudio() {
                if (this.audioContext && this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
            }
            
            updateSpeeds() {
                const speed = this.knobToSpeed(this.config.speedKnob);
                this.config.previewSpeed = speed;
                this.config.gameSpeed = speed;
                this.updateSpeedLabel();
            }
            
            updateSizes() {
                const scale = window.innerWidth < 400 ? 0.35 : 0.5;
                this.config.logoWidth = this.config.baseLogo.width * this.config.sizeMultiplier * scale;
                this.config.logoHeight = this.config.baseLogo.height * this.config.sizeMultiplier * scale;
                this.config.labelFontSize = this.config.baseLabelSize * this.config.sizeMultiplier;
                this.updatePlayerLabelSizes();
            }
            
            updatePreviewSpeeds() {
                // Update existing preview logos with new speed
                this.state.previewLogos.forEach(preview => {
                    if (preview) {
                        const directionX = preview.velocityX < 0 ? -1 : 1;
                        const directionY = preview.velocityY < 0 ? -1 : 1;
                        
                        preview.velocityX = directionX * this.config.previewSpeed;
                        preview.velocityY = directionY * this.config.previewSpeed;
                    }
                });
            }
            
            updatePreviewSizes() {
                // Update existing preview logos with new size
                this.state.previewLogos.forEach(preview => {
                    if (preview) {
                        preview.element.style.width = `${this.config.logoWidth}px`;
                    }
                });
            }

            updatePlayerLabelSizes() {
                const newSize = this.config.labelFontSize;
                document.querySelectorAll('.player-label').forEach(label => {
                    label.style.fontSize = `${newSize}px`;
                });
            }
            
            toggleFullscreen() {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(err => {
                        console.log('Error attempting to enable fullscreen:', err);
                    });
                } else {
                    document.exitFullscreen();
                }
            }

            toggleUIVisibility() {
                if (!this.state.gameRunning) return;
                this.state.uiHidden = !this.state.uiHidden;
                const action = this.state.uiHidden ? 'add' : 'remove';
                this.elements.bottomButtons.classList[action]('ui-hidden');
                this.elements.gameStats.classList[action]('ui-hidden');
            }
            
            setupPlayerEventListeners() {
                for (let i = 1; i <= this.state.currentPlayerCount; i++) {
                    const input = document.getElementById(`player${i}`);
                    if (input && !input.hasEventListener) {
                        input.addEventListener('input', (e) => {
                            this.updateButtons();
                            this.updatePreviewLogo(i, e.target.value.trim());
                        });
                        
                        input.addEventListener('keypress', (e) => {
                            if (e.key === 'Enter' && !this.state.gameStarted && this.canStartGame()) {
                                this.startGame();
                            }
                        });
                        
                        input.hasEventListener = true;
                    }
                }
            }
            
            updateButtons() {
                this.elements.buttons.start.disabled = !this.canStartGame();
                this.elements.buttons.addPlayer.disabled = this.state.currentPlayerCount >= this.state.maxPlayers;
            }

            canStartGame() {
                const inputs = document.querySelectorAll('input[id^="player"]');
                let filled = 0;
                inputs.forEach(input => {
                    if (input.value && input.value.trim() !== '') {
                        filled++;
                    }
                });
                return filled >= 1;
            }
            
            addPlayer() {
                if (this.state.currentPlayerCount >= this.state.maxPlayers) return;
                
                this.state.currentPlayerCount++;
                
                const playerInput = document.createElement('div');
                playerInput.className = 'player-input';
                playerInput.innerHTML = `
                    <label for="player${this.state.currentPlayerCount}">Player ${this.state.currentPlayerCount}:</label>
                    <input type="text" id="player${this.state.currentPlayerCount}" placeholder="Enter name" maxlength="12">
                `;
                
                this.elements.playerInputsContainer.appendChild(playerInput);
                this.setupPlayerEventListeners();
                this.updateButtons();
            }
            
            startGame() {
                if (this.state.gameStarted || !this.canStartGame()) return;
                this.elements.gameSetup.classList.add('hidden');
                this.elements.gameStats.classList.add('show');
                // Show/hide correct buttons
                this.elements.buttons.stop.style.display = 'block';
                this.elements.buttons.restart.style.display = 'none';
                this.elements.buttons.soundToggle.style.display = 'block';

                this.state.uiHidden = false;
                this.elements.bottomButtons.classList.remove('ui-hidden');
                this.elements.gameStats.classList.remove('ui-hidden');
                
                // Convert existing preview logos to game logos
                this.convertPreviewsToGameLogos();
                this.state.gameRunning = true;
                this.state.gameStarted = true;
                this.state.winner = null;
                this.animate();
                this.updateStats();
            }
            
            convertPreviewsToGameLogos() {
                this.state.players = [];
                
                // Get all active player names
                const activePlayers = this.getActivePlayers();
                
                activePlayers.forEach((playerData, index) => {
                    const preview = this.state.previewLogos[playerData.index];
                    
                    if (preview) {
                        // Convert existing preview to game player
                        preview.element.classList.remove('preview-logo');
                        preview.element.style.opacity = '1';
                        if (preview.animationFrameId) {
                            cancelAnimationFrame(preview.animationFrameId);
                        }
                        preview.cancelled = true;

                        const player = {
                            name: preview.name,
                            element: preview.element,
                            x: preview.x,
                            y: preview.y,
                            velocityX: (preview.velocityX / this.config.previewSpeed) * this.config.gameSpeed,
                            velocityY: (preview.velocityY / this.config.previewSpeed) * this.config.gameSpeed,
                            color: preview.color,
                            colorIndex: preview.colorIndex,
                            corners: 0,
                            bounces: 0 // RESET bounces for game - don't carry over from preview
                        };
                        
                        this.state.players.push(player);
                        this.state.previewLogos[playerData.index] = null;
                    } else {
                        // Create new player if no preview exists
                        const player = {
                            name: playerData.name,
                            element: this.createDVDElement(playerData.name, this.config.playerColors[playerData.index]),
                            x: Math.random() * (window.innerWidth - this.config.logoWidth),
                            y: Math.random() * (window.innerHeight - this.config.logoHeight),
                            velocityX: (Math.random() > 0.5 ? 1 : -1) * this.config.gameSpeed,
                            velocityY: (Math.random() > 0.5 ? 1 : -1) * this.config.gameSpeed,
                            color: this.config.playerColors[playerData.index],
                            colorIndex: playerData.index,
                            corners: 0,
                            bounces: 0
                        };
                        
                        this.state.players.push(player);
                        this.elements.container.appendChild(player.element);
                        this.updatePosition(player);
                    }
                });
                
                // Clear preview array since they're now game players
                this.state.previewLogos = [];
            }
            
            getActivePlayers() {
                const activePlayers = [];
                for (let i = 1; i <= this.state.currentPlayerCount; i++) {
                    const input = document.getElementById(`player${i}`);
                    if (input?.value.trim()) {
                        activePlayers.push({ name: input.value.trim(), index: i - 1 });
                    }
                }
                return activePlayers;
            }
            
            initializePlayers(playerData) {
                this.state.players = playerData.map(data => ({
                    name: data.name,
                    element: this.createDVDElement(data.name, this.config.playerColors[data.index]),
                    x: Math.random() * (window.innerWidth - this.config.logoWidth),
                    y: Math.random() * (window.innerHeight - this.config.logoHeight),
                    velocityX: (Math.random() > 0.5 ? 1 : -1) * this.config.gameSpeed,
                    velocityY: (Math.random() > 0.5 ? 1 : -1) * this.config.gameSpeed,
                    color: this.config.playerColors[data.index],
                    colorIndex: data.index,
                    corners: 0,
                    bounces: 0
                }));
                
                this.state.players.forEach(player => {
                    this.elements.container.appendChild(player.element);
                    this.updatePosition(player);
                });
            }
            
            createDVDElement(playerName, color, isPreview = false) {
                const logoDiv = document.createElement('div');
                logoDiv.className = isPreview ? 'dvd-logo preview-logo' : 'dvd-logo';
                logoDiv.style.width = `${this.config.logoWidth}px`;
                logoDiv.innerHTML = `
                    <svg width="100%" height="100%" viewBox="0 0 1058.4 465.84" xmlns="http://www.w3.org/2000/svg">
                        <g>
                            <path fill="${color}" d="m91.053 0-13.719 57.707 102.28 0.039063h24c65.747 0 105.91 26.44 94.746 73.4-12.147 51.133-69.613 73.4-130.67 73.4h-22.947l29.787-125.45h-102.27l-43.521 183.2h145.05c109.07 0 212.76-57.573 231.01-131.15 3.3467-13.507 2.8806-47.253-5.3594-67.359-0.21299-0.787-0.42594-1.4-1.1855-3-0.293-0.653-0.56012-3.6412 1.1465-4.2812 0.947-0.36 2.7069 1.4944 2.9336 2.041 0.853 2.24 1.5059 3.9062 1.5059 3.9062l92.293 260.6 234.97-265.21 99.535-0.089844h24c65.76 0 106.25 26.44 95.092 73.4-12.147 51.133-69.947 73.4-131 73.4h-22.959l29.799-125.47h-102.27l-43.533 183.21h145.07c109.05 0 213.48-57.4 231-131.15 17.52-73.75-59.107-131.15-168.69-131.15h-216.4s-57.319 67.88-67.959 80.693c-57.12 68.787-67.241 87.226-68.961 91.986 0.24-4.8-1.8138-23.412-26.174-92.959-6.48-18.52-27.359-79.721-27.359-79.721h-389.25zm408.77 324.16c-276.04 0-499.83 31.72-499.83 70.84s223.79 70.84 499.83 70.84c276.04 0 499.83-31.72 499.83-70.84s-223.79-70.84-499.83-70.84zm-18.094 48.627c63.04 0 114.13 10.573 114.13 23.613s-51.095 23.613-114.13 23.613c-63.027 0-114.13-10.573-114.13-23.613s51.106-23.613 114.13-23.613z"/>
                            <path fill="${color}" d="m963.6 445.05-0.73242 5.1738h13.08l-5.1074 36.32h5.7207l5.1055-36.32h11.68l0.72071-5.1738h-30.467zm41.215 0-13.693 41.494h5.4785l10.215-31.76h0.1328l7.1718 31.76 16.668-31.453h0.1191v31.453h5.4805v-41.494h-5.4805l-14.906 28.107-6.4395-28.107h-4.746z"/>
                        </g>
                    </svg>
                    <div class="player-label">${playerName}</div>
                `;
                logoDiv.style.filter = `drop-shadow(0 0 20px ${color}80)`;
                const label = logoDiv.querySelector('.player-label');
                if (label) {
                    label.style.fontSize = `${this.config.labelFontSize}px`;
                }
                return logoDiv;
            }
            
            updatePreviewLogo(playerNum, name) {
                const existingPreview = this.state.previewLogos[playerNum - 1];
                
                if (name && !existingPreview) {
                    // Only create new preview if name exists and no preview exists
                    const preview = {
                        name,
                        element: this.createDVDElement(name, this.config.playerColors[playerNum - 1], true),
                        x: Math.random() * (window.innerWidth - this.config.logoWidth),
                        y: Math.random() * (window.innerHeight - this.config.logoHeight),
                        velocityX: (Math.random() > 0.5 ? 1 : -1) * this.config.previewSpeed,
                        velocityY: (Math.random() > 0.5 ? 1 : -1) * this.config.previewSpeed,
                        color: this.config.playerColors[playerNum - 1],
                        colorIndex: playerNum - 1
                    };
                    
                    this.state.previewLogos[playerNum - 1] = preview;
                    this.elements.container.appendChild(preview.element);
                    this.updatePosition(preview);
                    this.animatePreview(preview);
                } else if (name && existingPreview) {
                    // Update existing preview name
                    const nameLabel = existingPreview.element.querySelector('.player-label');
                    if (nameLabel) {
                        nameLabel.textContent = name;
                    }
                    existingPreview.name = name;
                } else if (!name && existingPreview) {
                    // Remove preview if name is completely empty
                    if (existingPreview.element.parentNode) {
                        existingPreview.element.parentNode.removeChild(existingPreview.element);
                    }
                    if (existingPreview.animationFrameId) {
                        cancelAnimationFrame(existingPreview.animationFrameId);
                    }
                    existingPreview.cancelled = true;
                    this.state.previewLogos[playerNum - 1] = null;
                }
            }
            
            animatePreview(preview) {
                if (!preview?.element.parentNode || preview.cancelled) return;
                const prevX = preview.x;
                const prevY = preview.y;
                preview.x += preview.velocityX;
                preview.y += preview.velocityY;
                const { clientWidth, clientHeight } = this.elements.container;
                let hitWall = false;
                // Only trigger if crossing the boundary this frame
                if (preview.x < 0 && prevX >= 0) {
                    preview.x = 0;
                    preview.velocityX = Math.abs(preview.velocityX);
                    hitWall = true;
                } else if (preview.x + this.config.logoWidth > clientWidth && prevX + this.config.logoWidth <= clientWidth) {
                    preview.x = clientWidth - this.config.logoWidth;
                    preview.velocityX = -Math.abs(preview.velocityX);
                    hitWall = true;
                }
                if (preview.y < 0 && prevY >= 0) {
                    preview.y = 0;
                    preview.velocityY = Math.abs(preview.velocityY);
                    hitWall = true;
                } else if (preview.y + this.config.logoHeight > clientHeight && prevY + this.config.logoHeight <= clientHeight) {
                    preview.y = clientHeight - this.config.logoHeight;
                    preview.velocityY = -Math.abs(preview.velocityY);
                    hitWall = true;
                }
                if (hitWall) {
                    this.randomizeBounceAngle(preview);
                    this.changePreviewColor(preview);
                    this.addBounceEffect(preview);
                    this.playBounceSound();
                }
                this.updatePosition(preview);
                preview.animationFrameId = requestAnimationFrame(() => this.animatePreview(preview));
            }
            
            changePreviewColor(preview) {
                // Pick a random color that's different from the current one
                let newIndex = preview.colorIndex;
                const total = this.config.playerColors.length;
                if (total > 1) {
                    while (newIndex === preview.colorIndex) {
                        newIndex = Math.floor(Math.random() * total);
                    }
                }
                preview.colorIndex = newIndex;
                preview.color = this.config.playerColors[newIndex];
                
                const svgPaths = preview.element.querySelectorAll('path');
                svgPaths.forEach(path => path.style.fill = preview.color);
                preview.element.style.filter = `drop-shadow(0 0 20px ${preview.color}80)`;
            }
            
            updatePosition(obj) {
                obj.element.style.left = `${obj.x}px`;
                obj.element.style.top = `${obj.y}px`;
            }
            
            checkCollision(player) {
                if (!this.state.gameStarted) return { hitWall: false, hitCorner: false };
                
                const { clientWidth, clientHeight } = this.elements.container;
                const prevX = player.x - player.velocityX;
                const prevY = player.y - player.velocityY;
                let hitWall = false;
                let hitHorizontal = false;
                let hitVertical = false;
                // Only trigger if crossing the boundary this frame
                if (player.x < 0 && prevX >= 0) {
                    player.x = 0;
                    player.velocityX = Math.abs(player.velocityX);
                    hitWall = true;
                    hitHorizontal = true;
                } else if (player.x + this.config.logoWidth > clientWidth && prevX + this.config.logoWidth <= clientWidth) {
                    player.x = clientWidth - this.config.logoWidth;
                    player.velocityX = -Math.abs(player.velocityX);
                    hitWall = true;
                    hitHorizontal = true;
                }
                if (player.y < 0 && prevY >= 0) {
                    player.y = 0;
                    player.velocityY = Math.abs(player.velocityY);
                    hitWall = true;
                    hitVertical = true;
                } else if (player.y + this.config.logoHeight > clientHeight && prevY + this.config.logoHeight <= clientHeight) {
                    player.y = clientHeight - this.config.logoHeight;
                    player.velocityY = -Math.abs(player.velocityY);
                    hitWall = true;
                    hitVertical = true;
                }
                if (hitWall) {
                    this.randomizeBounceAngle(player);
                    // Count bounces ONLY during actual gameplay
                    player.bounces++;
                    this.changePlayerColor(player);
                    this.addBounceEffect(player);
                    this.playBounceSound();
                    // Check for corner hit (both horizontal and vertical walls hit)
                    if (hitHorizontal && hitVertical) {
                        player.corners++;
                        this.handleWin(player);
                        return { hitWall, hitCorner: true };
                    }
                }
                
                return { hitWall, hitCorner: false };
            }
            
            changePlayerColor(player) {
                // Randomly select a new color index different from the current one
                let newIndex = player.colorIndex;
                const total = this.config.playerColors.length;
                if (total > 1) {
                    while (newIndex === player.colorIndex) {
                        newIndex = Math.floor(Math.random() * total);
                    }
                }
                player.colorIndex = newIndex;
                player.color = this.config.playerColors[newIndex];
                
                const svgPaths = player.element.querySelectorAll('path');
                svgPaths.forEach(path => path.style.fill = player.color);
                player.element.style.filter = `drop-shadow(0 0 20px ${player.color}80)`;
            }
            
            addBounceEffect(player) {
                player.element.classList.add('bounce-effect');
                setTimeout(() => player.element?.classList.remove('bounce-effect'), 50);
            }

            randomizeBounceAngle(obj) {
                const speed = Math.sqrt(obj.velocityX * obj.velocityX + obj.velocityY * obj.velocityY);
                const angle = (35 + Math.random() * 20) * (Math.PI / 180);
                const signX = Math.sign(obj.velocityX) || 1;
                const signY = Math.sign(obj.velocityY) || 1;
                obj.velocityX = Math.cos(angle) * speed * signX;
                obj.velocityY = Math.sin(angle) * speed * signY;
            }
            
            handleWin(winningPlayer) {
                if (this.state.winner) return;
                
                this.state.winner = winningPlayer;
                this.state.gameRunning = false;
                
                // Stop all players
                this.state.players.forEach(player => {
                    player.velocityX = 0;
                    player.velocityY = 0;
                });
                
                this.showWinnerScreen(winningPlayer);
            }
            
            showWinnerScreen(winner) {
                // Ensure UI is visible when showing the winner screen
                this.state.uiHidden = false;
                this.elements.bottomButtons.classList.remove('ui-hidden');
                this.elements.gameStats.classList.remove('ui-hidden');

                // Show the overlay
                this.elements.winnerOverlay.classList.add('show');
                this.elements.winnerOverlay.classList.add('winner-animation');
                // Set overlay text
                this.elements.winnerName.textContent = winner.name;
                this.elements.winnerBounces.textContent = `Hit a corner after ${winner.bounces} bounces`;
                // Set overlay title to WINNER!
                const winnerTitle = document.querySelector('.winner-title');
                if (winnerTitle) winnerTitle.textContent = 'WINNER!';
                // Remove any previous logo
                this.elements.winnerLogoDisplay.innerHTML = '';
                // Create a fresh logo (not a clone of the in-game element)
                const logo = document.createElement('div');
                logo.className = 'winner-logo';
                logo.innerHTML = `
                    <svg width="100%" height="100%" viewBox="0 0 1058.4 465.84" xmlns="http://www.w3.org/2000/svg">
                        <g>
                            <path fill="${winner.color}" d="m91.053 0-13.719 57.707 102.28 0.039063h24c65.747 0 105.91 26.44 94.746 73.4-12.147 51.133-69.613 73.4-130.67 73.4h-22.947l29.787-125.45h-102.27l-43.521 183.2h145.05c109.07 0 212.76-57.573 231.01-131.15 3.3467-13.507 2.8806-47.253-5.3594-67.359-0.21299-0.787-0.42594-1.4-1.1855-3-0.293-0.653-0.56012-3.6412 1.1465-4.2812 0.947-0.36 2.7069 1.4944 2.9336 2.041 0.853 2.24 1.5059 3.9062 1.5059 3.9062l92.293 260.6 234.97-265.21 99.535-0.089844h24c65.76 0 106.25 26.44 95.092 73.4-12.147 51.133-69.947 73.4-131 73.4h-22.959l29.799-125.47h-102.27l-43.533 183.21h145.07c109.05 0 213.48-57.4 231-131.15 17.52-73.75-59.107-131.15-168.69-131.15h-216.4s-57.319 67.88-67.959 80.693c-57.12 68.787-67.241 87.226-68.961 91.986 0.24-4.8-1.8138-23.412-26.174-92.959-6.48-18.52-27.359-79.721-27.359-79.721h-389.25zm408.77 324.16c-276.04 0-499.83 31.72-499.83 70.84s223.79 70.84 499.83 70.84c276.04 0 499.83-31.72 499.83-70.84s-223.79-70.84-499.83-70.84zm-18.094 48.627c63.04 0 114.13 10.573 114.13 23.613s-51.095 23.613-114.13 23.613c-63.027 0-114.13-10.573-114.13-23.613s51.106-23.613 114.13-23.613z"/>
                            <path fill="${winner.color}" d="m963.6 445.05-0.73242 5.1738h13.08l-5.1074 36.32h5.7207l5.1055-36.32h11.68l0.72071-5.1738h-30.467zm41.215 0-13.693 41.494h5.4785l10.215-31.76h0.1328l7.1718 31.76 16.668-31.453h0.1191v31.453h5.4805v-41.494h-5.4805l-14.906 28.107-6.4395-28.107h-4.746z"/>
                        </g>
                    </svg>
                    <div class="player-label">${winner.name}</div>
    `;
    this.elements.winnerLogoDisplay.appendChild(logo);
    // Play winner jingle
    this.playWinnerJingle();
    // Show/hide correct buttons (order matters: hide stop, show restart)
    this.elements.buttons.stop.style.display = 'none';
    this.elements.buttons.restart.style.display = 'block';
    this.elements.buttons.soundToggle.style.display = 'block';
}
            
            updateStats() {
                if (!this.state.players.length) return;
                
                let statsHTML = '<div style="margin-bottom: 15px; color: var(--neon-cyan);"><strong>Live Stats:</strong></div>';
                this.state.players.forEach(player => {
                    statsHTML += `
                        <div style="margin-bottom: 8px; color: ${player.color}; text-shadow: 0 0 10px ${player.color};">
                            <strong>${player.name}:</strong> ${player.bounces} bounces
                        </div>
                    `;
                });
                this.elements.gameStats.innerHTML = statsHTML;
            }
            
            updatePlayer(player) {
                if (!this.state.gameRunning) return;
                
                player.x += player.velocityX;
                player.y += player.velocityY;
                
                this.checkCollision(player);
                this.updatePosition(player);
            }
            
            animate() {
                if (!this.state.gameRunning) return;
                
                this.state.players.forEach(player => this.updatePlayer(player));
                this.updateStats();
                
                requestAnimationFrame(() => this.animate());
            }
            
            stopGame() {
                this.state.gameRunning = false;
                this.state.gameStarted = false;
                this.state.uiHidden = false;
                this.cleanupPlayers();
                // Show/hide correct buttons
                this.elements.buttons.stop.style.display = 'none';
                this.elements.buttons.restart.style.display = 'none';
                this.elements.buttons.soundToggle.style.display = 'block';
                this.elements.bottomButtons.classList.remove('ui-hidden');
                this.elements.gameStats.classList.remove('ui-hidden');
                this.elements.gameStats.classList.remove('show');
                this.elements.gameStats.innerHTML = '';
                this.elements.gameSetup.classList.remove('hidden');
                this.respawnPreviewLogos();
                this.updateButtons();
            }

            restartGame() {
                this.cleanupPlayers();
                this.clearPreviewLogos();
                Object.assign(this.state, {
                    gameRunning: false,
                    gameStarted: false,
                    winner: null,
                    uiHidden: false
                });
                this.elements.winnerOverlay.classList.remove('show');
                this.elements.winnerOverlay.classList.remove('winner-animation');
                // Show/hide correct buttons
                this.elements.buttons.stop.style.display = 'none';
                this.elements.buttons.restart.style.display = 'none';
                this.elements.buttons.soundToggle.style.display = 'block';
                this.elements.bottomButtons.classList.remove('ui-hidden');
                this.elements.gameStats.classList.remove('ui-hidden');
                this.elements.gameStats.classList.remove('show');
                this.elements.gameSetup.classList.remove('hidden');
                this.elements.gameStats.innerHTML = '';
                this.respawnPreviewLogos();
                this.updateButtons();
            }
            
            cleanupPlayers() {
                this.state.players.forEach(player => {
                    if (player.element?.parentNode) {
                        player.element.parentNode.removeChild(player.element);
                    }
                });
                this.state.players = [];
            }
            
            clearPreviewLogos() {
                for (let i = 0; i < this.state.maxPlayers; i++) {
                    const prev = this.state.previewLogos[i];
                    if (prev?.element.parentNode) {
                        prev.element.parentNode.removeChild(prev.element);
                    }
                    if (prev?.animationFrameId) {
                        cancelAnimationFrame(prev.animationFrameId);
                    }
                    if (prev) prev.cancelled = true;
                }
                this.state.previewLogos = [];
            }

            respawnPreviewLogos() {
                this.clearPreviewLogos();
                for (let i = 1; i <= this.state.currentPlayerCount; i++) {
                    const input = document.getElementById(`player${i}`);
                    if (input && input.value.trim()) {
                        this.updatePreviewLogo(i, input.value.trim());
                    }
                }
            }
            
            resetPlayerInputs() {
                // Remove excess player inputs
                while (this.state.currentPlayerCount > 3) {
                    const lastInput = this.elements.playerInputsContainer.lastElementChild;
                    if (lastInput) {
                        lastInput.remove();
                    }
                    this.state.currentPlayerCount--;
                }
                
                // Clear remaining inputs
                for (let i = 1; i <= this.state.currentPlayerCount; i++) {
                    const input = document.getElementById(`player${i}`);
                    if (input) {
                        input.value = '';
                    }
                }
            }
        }
        
        // Initialize game when page loads
        window.addEventListener('load', () => {
            const p1 = document.getElementById('player1');
            if (p1) {
                p1.value = 'Player 1';
            }
            const game = new DVDCornerChallenge();
            if (p1) {
                game.updatePreviewLogo(1, p1.value.trim());
                p1.focus();
                // Place cursor at end of default text for quick deletion
                const len = p1.value.length;
                try {
                    p1.setSelectionRange(len, len);
                } catch (e) {
                    // Some older browsers may not support setSelectionRange
                }
            }
        });
