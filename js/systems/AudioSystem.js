// Procedural audio system using Web Audio API
// Generates BGM, SFX, and handles vibration feedback
export class AudioSystem {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.bgmGain = null;
        this.sfxGain = null;
        this.currentBgm = null;
        this.bgmVolume = 0.3;
        this.sfxVolume = 0.5;
        this.muted = false;
    }

    init() {
        if (this.ctx) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.value = this.bgmVolume;
        this.bgmGain.connect(this.masterGain);
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = this.sfxVolume;
        this.sfxGain.connect(this.masterGain);
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        this.masterGain.gain.value = this.muted ? 0 : 1;
        return this.muted;
    }

    // --- BGM (procedural chiptune loops) ---
    playBGM(type) {
        this.init();
        this.stopBGM();

        switch (type) {
            case 'title': this._bgmTitle(); break;
            case 'city': this._bgmCity(); break;
            case 'battle': this._bgmBattle(); break;
            case 'boss': this._bgmBoss(); break;
            case 'dungeon': this._bgmDungeon(); break;
            case 'shop': this._bgmShop(); break;
            case 'victory': this._bgmVictory(); break;
        }
    }

    stopBGM() {
        if (this.currentBgm) {
            try { this.currentBgm.stop(); } catch (e) {}
            this.currentBgm = null;
        }
        if (this._bgmInterval) {
            clearInterval(this._bgmInterval);
            this._bgmInterval = null;
        }
    }

    _bgmTitle() {
        // Mysterious ambient pad with arpeggio
        const notes = [261.6, 329.6, 392.0, 523.3, 392.0, 329.6]; // C E G C' G E
        let idx = 0;
        this._bgmInterval = setInterval(() => {
            this._playNote(notes[idx % notes.length], 0.6, 'sine', this.bgmGain, 0.08);
            // Pad underneath
            if (idx % 6 === 0) {
                this._playNote(130.8, 3.0, 'sine', this.bgmGain, 0.04);
                this._playNote(164.8, 3.0, 'sine', this.bgmGain, 0.03);
            }
            idx++;
        }, 500);
    }

    _bgmCity() {
        // Peaceful town melody
        const melody = [523.3, 587.3, 659.3, 523.3, 587.3, 659.3, 784.0, 659.3];
        const bass = [130.8, 130.8, 164.8, 164.8, 174.6, 174.6, 196.0, 196.0];
        let idx = 0;
        this._bgmInterval = setInterval(() => {
            const i = idx % melody.length;
            this._playNote(melody[i], 0.35, 'triangle', this.bgmGain, 0.06);
            this._playNote(bass[i], 0.4, 'sine', this.bgmGain, 0.04);
            idx++;
        }, 400);
    }

    _bgmBattle() {
        // Intense battle rhythm
        const melody = [392, 440, 523, 440, 392, 349, 330, 392];
        const bass = [196, 196, 220, 220, 174, 174, 165, 196];
        let idx = 0;
        this._bgmInterval = setInterval(() => {
            const i = idx % melody.length;
            this._playNote(melody[i], 0.18, 'square', this.bgmGain, 0.05);
            this._playNote(bass[i], 0.2, 'sawtooth', this.bgmGain, 0.03);
            // Drum beat
            if (idx % 2 === 0) this._playNoise(0.05, this.bgmGain, 0.08);
            idx++;
        }, 220);
    }

    _bgmBoss() {
        // Epic boss battle
        const melody = [330, 392, 440, 523, 494, 440, 392, 330];
        const bass = [110, 110, 146.8, 146.8, 130.8, 130.8, 110, 110];
        let idx = 0;
        this._bgmInterval = setInterval(() => {
            const i = idx % melody.length;
            this._playNote(melody[i], 0.15, 'square', this.bgmGain, 0.06);
            this._playNote(bass[i], 0.2, 'sawtooth', this.bgmGain, 0.04);
            this._playNote(melody[i] * 2, 0.1, 'sine', this.bgmGain, 0.02);
            // Heavy drum
            if (idx % 2 === 0) this._playNoise(0.08, this.bgmGain, 0.1);
            if (idx % 4 === 0) this._playNoise(0.12, this.bgmGain, 0.12);
            idx++;
        }, 180);
    }

    _bgmDungeon() {
        // Dark, tense atmosphere
        const notes = [196, 220, 196, 185, 196, 220, 247, 220];
        let idx = 0;
        this._bgmInterval = setInterval(() => {
            const i = idx % notes.length;
            this._playNote(notes[i], 0.5, 'sine', this.bgmGain, 0.04);
            if (idx % 4 === 0) {
                this._playNote(98, 2.0, 'sine', this.bgmGain, 0.03);
            }
            // Eerie effect
            if (idx % 8 === 3) {
                this._playNote(notes[i] * 1.5, 1.0, 'sine', this.bgmGain, 0.015);
            }
            idx++;
        }, 600);
    }

    _bgmShop() {
        // Cheerful shop music
        const melody = [523, 587, 659, 784, 659, 587, 523, 659];
        let idx = 0;
        this._bgmInterval = setInterval(() => {
            this._playNote(melody[idx % melody.length], 0.3, 'triangle', this.bgmGain, 0.05);
            if (idx % 2 === 0) this._playNote(262, 0.3, 'sine', this.bgmGain, 0.03);
            idx++;
        }, 350);
    }

    _bgmVictory() {
        // Victory fanfare (one-shot, not looping)
        const fanfare = [523, 659, 784, 1047];
        fanfare.forEach((note, i) => {
            setTimeout(() => {
                this._playNote(note, 0.4, 'triangle', this.bgmGain, 0.08);
                this._playNote(note / 2, 0.4, 'sine', this.bgmGain, 0.04);
            }, i * 200);
        });
    }

    // --- SFX ---
    playSFX(type) {
        this.init();
        switch (type) {
            case 'attack': this._sfxAttack(); break;
            case 'hit': this._sfxHit(); break;
            case 'magic': this._sfxMagic(); break;
            case 'heal': this._sfxHeal(); break;
            case 'levelup': this._sfxLevelUp(); break;
            case 'menu': this._sfxMenu(); break;
            case 'buy': this._sfxBuy(); break;
            case 'error': this._sfxError(); break;
            case 'portal': this._sfxPortal(); break;
            case 'chest': this._sfxChest(); break;
            case 'defeat': this._sfxDefeat(); break;
            case 'click': this._sfxClick(); break;
            case 'dialog': this._sfxDialog(); break;
            case 'awakening': this._sfxAwakening(); break;
        }
    }

    _sfxAttack() {
        this._playNoise(0.08, this.sfxGain, 0.2);
        this._playNote(200, 0.08, 'sawtooth', this.sfxGain, 0.15);
        this._playNote(150, 0.06, 'sawtooth', this.sfxGain, 0.1);
    }

    _sfxHit() {
        this._playNoise(0.1, this.sfxGain, 0.25);
        this._playNote(100, 0.1, 'square', this.sfxGain, 0.15);
    }

    _sfxMagic() {
        [800, 1000, 1200, 1400].forEach((f, i) => {
            setTimeout(() => this._playNote(f, 0.15, 'sine', this.sfxGain, 0.08), i * 50);
        });
    }

    _sfxHeal() {
        [523, 659, 784, 1047].forEach((f, i) => {
            setTimeout(() => this._playNote(f, 0.2, 'sine', this.sfxGain, 0.1), i * 80);
        });
    }

    _sfxLevelUp() {
        [523, 659, 784, 1047, 1319].forEach((f, i) => {
            setTimeout(() => {
                this._playNote(f, 0.3, 'triangle', this.sfxGain, 0.12);
                this._playNote(f / 2, 0.3, 'sine', this.sfxGain, 0.06);
            }, i * 100);
        });
    }

    _sfxMenu() { this._playNote(880, 0.05, 'sine', this.sfxGain, 0.06); }
    _sfxBuy() { this._playNote(1200, 0.1, 'triangle', this.sfxGain, 0.1); this._playNote(1400, 0.1, 'triangle', this.sfxGain, 0.08); }
    _sfxError() { this._playNote(200, 0.15, 'square', this.sfxGain, 0.1); this._playNote(150, 0.2, 'square', this.sfxGain, 0.1); }
    _sfxPortal() {
        [300, 400, 500, 600, 700, 800].forEach((f, i) => {
            setTimeout(() => this._playNote(f, 0.3, 'sine', this.sfxGain, 0.06), i * 60);
        });
    }
    _sfxChest() {
        [523, 784, 1047].forEach((f, i) => {
            setTimeout(() => this._playNote(f, 0.2, 'triangle', this.sfxGain, 0.1), i * 120);
        });
    }
    _sfxDefeat() {
        [400, 350, 300, 200].forEach((f, i) => {
            setTimeout(() => this._playNote(f, 0.3, 'sawtooth', this.sfxGain, 0.08), i * 200);
        });
    }
    _sfxClick() { this._playNote(1000, 0.03, 'sine', this.sfxGain, 0.05); }
    _sfxDialog() { this._playNote(600 + Math.random() * 200, 0.03, 'square', this.sfxGain, 0.03); }
    _sfxAwakening() {
        [200, 300, 400, 600, 800, 1000, 1200, 1600].forEach((f, i) => {
            setTimeout(() => {
                this._playNote(f, 0.5, 'sine', this.sfxGain, 0.08);
                this._playNote(f * 1.5, 0.4, 'sine', this.sfxGain, 0.04);
            }, i * 150);
        });
    }

    // --- Vibration ---
    vibrate(pattern) {
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }

    vibrateHit() { this.vibrate([50]); }
    vibrateCritical() { this.vibrate([100, 50, 100]); }
    vibrateLevelUp() { this.vibrate([50, 30, 50, 30, 100]); }
    vibrateDefeat() { this.vibrate([200, 100, 200]); }

    // --- Helpers ---
    _playNote(freq, duration, type, dest, volume) {
        if (!this.ctx || this.muted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(dest);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    _playNoise(duration, dest, volume) {
        if (!this.ctx || this.muted) return;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        source.connect(gain);
        gain.connect(dest);
        source.start();
    }
}

// Singleton
export const audio = new AudioSystem();
