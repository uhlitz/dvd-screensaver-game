# DVD Corner Hit Challenge

A modern, neon-styled browser game inspired by the classic DVD screensaver, where players compete to see whose logo hits a screen corner first.

## Features
- **Multiplayer:** Supports up to 12 players, each with a custom name and color-coded logo.
- **Animated DVD Logos:** Each player is represented by a bouncing DVD logo with their name.
- **Corner Hit Challenge:** The first logo to hit a screen corner wins the round.
- **Live Preview:** As players enter their names, their logo previews bounce around the screen.
- **Customizable Game Settings:**
  - **Game Speed:** Adjustable via slider (1-5).
  - **Logo Size:** Adjustable via slider (1-5).
- **Neon Arcade UI:** Stylish, animated buttons and overlays with neon effects.r
- **Fullscreen Mode:** Toggle fullscreen for an immersive experience (F11 button or 'F' key).
- **Sound Effects:** Audio feedback on logo bounces (Web Audio API).
- **Victory Overlay:** Animated winner announcement with stats and replay option.

## How to Play
1. Enter player names (at least one required).
2. (Optional) Add more players (up to 12).
3. Adjust game speed and logo size as desired.
4. Click **Start Game**.
5. Watch as each logo bounces around the screen. The first to hit a corner wins!
6. Use **Play Again** to restart, or **Stop Game** to return to setup.

## Controls
- **'F' key:** Toggle fullscreen mode.
- **Add Player:** Add a new player input (up to 12).
- **Start Game:** Begin the challenge.
- **Stop Game:** End the current game and return to setup.
- **Play Again:** Restart after a win.

## Technical Overview
- **Single HTML file:** All logic, styles, and markup are contained in `dvd-screensaver-game.html`.
- **No dependencies:** Pure HTML, CSS, and JavaScript.
- **Responsive:** Adapts to window resizing and fullscreen.
- **Modern CSS:** Uses CSS variables, gradients, and custom animations for a retro-futuristic look.
- **Game Loop:** Uses `requestAnimationFrame` for smooth animation.
- **Audio:** Uses Web Audio API for bounce sound effects.

## Customization
- **Player Colors:** Easily extendable in the `playerColors` array in the script.
- **Logo SVG:** The DVD logo is an inline SVG, customizable for different styles.

## License
MIT License. Free to use and modify.

---

Vibe coded with Claude 4 Sonet and GPT 4.1.
