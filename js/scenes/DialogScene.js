// Dialog overlay scene - responsive text display
export class DialogScene extends Phaser.Scene {
    constructor() {
        super('Dialog');
    }

    init(data) {
        this.dialogData = data.dialogs || [];
        this.onComplete = data.onComplete || (() => {});
        this.currentIndex = 0;
    }

    create() {
        this.audio = this.registry.get('audio');
        this._buildUI();

        // Rebuild on resize
        this.scale.on('resize', () => {
            this.children.removeAll(true);
            this._buildUI();
            this._showDialog();
        });

        this._showDialog();

        this.input.on('pointerdown', () => {
            if (this._isTyping) {
                this._finishTyping();
            } else {
                this.currentIndex++;
                if (this.currentIndex >= this.dialogData.length) {
                    this._close();
                } else {
                    this._showDialog();
                }
            }
        });
    }

    _buildUI() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        const s = Math.min(w / 800, h / 600);
        const fs = Math.max(16, Math.floor(20 * s));

        // Overlay
        this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.3);

        // Dialog box - 94% width, bottom 38% of screen for better readability
        const boxW = w * 0.94;
        const boxH = Math.max(160, h * 0.38);
        const boxY = h - boxH / 2 - 6;
        const boxX = w / 2;

        // Box background
        const box = this.add.rectangle(boxX, boxY, boxW, boxH, 0x0a0a1e, 0.96);
        box.setStrokeStyle(2, 0x00d4ff);

        // Inner padding
        const padX = boxX - boxW / 2 + 20;
        const padTop = boxY - boxH / 2 + 14;
        const textW = boxW - 40;

        // Speaker name
        this.speakerText = this.add.text(padX, padTop, '', {
            fontSize: `${Math.max(16, Math.floor(20 * s))}px`,
            fontFamily: 'monospace',
            color: '#00d4ff',
            fontStyle: 'bold',
        });

        // Dialog text - large readable font, auto word wrap
        this.dialogText = this.add.text(padX, padTop + 30 * s, '', {
            fontSize: `${fs}px`,
            fontFamily: 'monospace',
            color: '#fff',
            wordWrap: { width: textW, useAdvancedWrap: true },
            lineSpacing: Math.max(6, 10 * s),
        });

        // Continue prompt
        this.promptText = this.add.text(boxX + boxW / 2 - 12, boxY + boxH / 2 - 14, '▼ 點擊繼續', {
            fontSize: `${Math.max(12, Math.floor(14 * s))}px`,
            fontFamily: 'monospace',
            color: '#7f8c8d'
        }).setOrigin(1, 0.5);

        this.tweens.add({
            targets: this.promptText,
            alpha: { from: 0.3, to: 1 },
            duration: 800, yoyo: true, repeat: -1,
        });
    }

    _showDialog() {
        const d = this.dialogData[this.currentIndex];
        if (!d) return;

        if (d.style === 'system') {
            this.speakerText.setColor('#00ff41');
            this.dialogText.setColor('#00ff41');
        } else {
            this.speakerText.setColor('#00d4ff');
            this.dialogText.setColor('#fff');
        }

        this.speakerText.setText(d.speaker || '');
        this._typeText(d.text);

        if (d.effect === 'flash') {
            this.cameras.main.flash(500, 0, 212, 255);
        }
    }

    _typeText(text) {
        this._isTyping = true;
        this._fullText = text;
        this.dialogText.setText('');
        let i = 0;
        this._typeTimer = this.time.addEvent({
            delay: 25,
            callback: () => {
                this.dialogText.setText(text.substring(0, i + 1));
                if (this.audio && i % 3 === 0) this.audio.playSFX('dialog');
                i++;
                if (i >= text.length) {
                    this._isTyping = false;
                    this._typeTimer.remove();
                }
            },
            repeat: text.length - 1,
        });
    }

    _finishTyping() {
        if (this._typeTimer) this._typeTimer.remove();
        this.dialogText.setText(this._fullText);
        this._isTyping = false;
    }

    _close() {
        this.scene.stop();
        this.onComplete();
    }
}
