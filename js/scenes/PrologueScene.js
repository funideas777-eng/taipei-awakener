// Prologue - awakening tutorial sequence
import { STORY } from '../data/story.js';
import { MONSTERS } from '../data/monsters.js';

export class PrologueScene extends Phaser.Scene {
    constructor() {
        super('Prologue');
    }

    create() {
        this.phase = 0;
        this.player = this.registry.get('player');
        this._startPhase0();
    }

    // Phase 0: Daily life scene
    _startPhase0() {
        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor('#1a1a2e');

        // MRT station background
        this.add.rectangle(width / 2, height / 2 - 50, 600, 250, 0x2c3e50);
        this.add.text(width / 2, height / 2 - 140, '內湖捷運站', {
            fontSize: '24px', fontFamily: 'monospace', color: '#3498db'
        }).setOrigin(0.5);

        // Time display
        this.add.text(width / 2, height / 2 - 110, 'PM 8:23', {
            fontSize: '14px', fontFamily: 'monospace', color: '#7f8c8d'
        }).setOrigin(0.5);

        // Player sprite
        this.playerSprite = this.add.image(width / 2, height / 2, 'player-sheet', 1).setScale(2);

        // Start prologue dialog
        this.time.delayedCall(500, () => {
            this.scene.launch('Dialog', {
                dialogs: STORY.prologue,
                onComplete: () => this._startPhase1()
            });
        });
    }

    // Phase 1: Awakening
    _startPhase1() {
        this.phase = 1;
        const { width, height } = this.cameras.main;

        // Screen flash
        this.cameras.main.flash(1000, 0, 212, 255);

        // Awakening effect
        this.time.delayedCall(1200, () => {
            // System window appears
            this.scene.launch('Dialog', {
                dialogs: STORY.awakening,
                onComplete: () => this._startPhase2()
            });
        });
    }

    // Phase 2: First portal
    _startPhase2() {
        this.phase = 2;
        const { width, height } = this.cameras.main;

        // Show portal appearing
        const portal = this.add.image(width / 2 + 150, height / 2, 'portal-E').setScale(2).setAlpha(0);
        this.tweens.add({
            targets: portal,
            alpha: 1,
            scaleX: 2.5,
            scaleY: 2.5,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => {
                // Portal pulse animation
                this.tweens.add({
                    targets: portal,
                    scaleX: { from: 2.3, to: 2.7 },
                    scaleY: { from: 2.3, to: 2.7 },
                    duration: 1000,
                    yoyo: true,
                    repeat: -1,
                });

                this.scene.launch('Dialog', {
                    dialogs: STORY.firstPortal,
                    onComplete: () => this._startPhase3()
                });
            }
        });
    }

    // Phase 3: Tutorial battle
    _startPhase3() {
        this.phase = 3;

        // Show tutorial tips first
        this.scene.launch('Dialog', {
            dialogs: STORY.tutorialBattle,
            onComplete: () => {
                // Start actual battle with slime
                const monster = { ...MONSTERS.slime };
                this.scene.start('Battle', {
                    monster,
                    isTutorial: true,
                    onWin: () => this._afterFirstBattle(),
                    returnScene: 'Prologue',
                    returnData: { phase: 'afterBattle' },
                });
            }
        });
    }

    // Called when returning from battle
    _afterFirstBattle() {
        // Grant first battle rewards
        const player = this.registry.get('player');
        player.addExp(50);
        player.addGold(30);
        player.addItem({ id: 'potion-s', name: '回復藥水(小)', type: 'consumable', subType: 'hp', value: 50, price: 30 });

        this.scene.launch('Dialog', {
            dialogs: STORY.afterFirstBattle,
            onComplete: () => this._startPhase4()
        });
    }

    _startPhase4() {
        // Organization contact
        this.scene.launch('Dialog', {
            dialogs: STORY.organizationContact,
            onComplete: () => {
                const player = this.registry.get('player');
                player.prologueComplete = true;
                // Give starting items
                player.addItem({ id: 'wooden-bat', name: '木棒', type: 'weapon', atk: 5, price: 50, desc: '隨手撿來的木棒' });
                player.addItem({ id: 'cloth-armor', name: '布甲', type: 'armor', def: 3, price: 40, desc: '薄薄的布製護甲' });
                player.addItem({ id: 'potion-s', name: '回復藥水(小)', type: 'consumable', subType: 'hp', value: 50, price: 30 });
                player.addItem({ id: 'potion-s', name: '回復藥水(小)', type: 'consumable', subType: 'hp', value: 50, price: 30 });
                player.addItem({ id: 'potion-s', name: '回復藥水(小)', type: 'consumable', subType: 'hp', value: 50, price: 30 });
                player.equip('wooden-bat');
                player.equip('cloth-armor');
                // Start city scene
                this.scene.start('City', { city: 'taipei' });
            }
        });
    }
}

