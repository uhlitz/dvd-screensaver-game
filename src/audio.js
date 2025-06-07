export default class AudioManager {
    constructor() {
        this.soundEnabled = false;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
            this.audioContext = null;
        }
    }

    enable() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    toggle() {
        this.soundEnabled = !this.soundEnabled;
    }

    playBounce() {
        if (!this.audioContext || !this.soundEnabled) return;
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        } catch {}
    }

    playWinner() {
        if (!this.audioContext || !this.soundEnabled) return;
        try {
            const notes = [523.25, 659.25, 783.99, 1046.5];
            const noteDuration = 0.18;
            const now = this.audioContext.currentTime;
            notes.forEach((freq, idx) => {
                const osc = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + idx * noteDuration);
                osc.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                gainNode.gain.setValueAtTime(0.15, now + idx * noteDuration);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + (idx + 1) * noteDuration);
                osc.start(now + idx * noteDuration);
                osc.stop(now + (idx + 1) * noteDuration);
            });
        } catch {}
    }
}
