// Dialog overlay scene for story conversations
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
        const { width, height } = this.cameras.main;

        // Semi-transparent overlay
        this.overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.3);

        // Dialog box
        this.dialogBox = this.add.image(width / 2, height - 90, 'ui-dialog');

        // Speaker name
        this.speakerText = this.add.text(80, height - 160, '', {
            fontSize: '16px', fontFamily: 'monospace', color: '#00d4ff', fontStyle: 'bold'
        });

        // Dialog text
        this.dialogText = this.add.text(80, height - 135, '', {
            fontSize: '14px', fontFamily: 'monospace', color: '#fff',
            wordWrap: { width: 640 }, lineSpacing: 6,
        });

        // Continue prompt
        this.promptText = this.add.text(width - 80, height - 25, '▼ 點擊繼續', {
            fontSize: '11px', fontFamily: 'monospace', color: '#7f8c8d'
        }).setOrigin(1, 0.5);

        this.tweens.add({
            targets: this.promptText,
            alpha: { from: 0.3, to: 1 },
            duration: 800,
            yoyo: true,
            repeat: -1,
        });

        // Show first dialog
        this._showDialog();

        // Click to advance
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

    _showDialog() {
        const d = this.dialogData[this.currentIndex];
        if (!d) return;

        // System style
        if (d.style === 'system') {
            this.speakerText.setColor('#00ff41');
            this.dialogText.setColor('#00ff41');
        } else {
            this.speakerText.setColor('#00d4ff');
            this.dialogText.setColor('#fff');
        }

        this.speakerText.setText(d.speaker || '');
        this._typeText(d.text);

        // Flash effect
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
            delay: 30,
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
