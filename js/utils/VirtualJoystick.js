// Virtual joystick for mobile touch controls
export class VirtualJoystick {
    constructor(scene, x, y, opts = {}) {
        this.scene = scene;
        this.baseR = opts.baseRadius || 50;
        this.thumbR = opts.thumbRadius || 22;
        this.active = false;
        this.dir = { x: 0, y: 0 };
        this.pointerId = null;

        this.base = scene.add.circle(x, y, this.baseR, 0x000000, 0.25)
            .setStrokeStyle(2, 0x00d4ff, 0.4).setScrollFactor(0).setDepth(1000);
        this.thumb = scene.add.circle(x, y, this.thumbR, 0x00d4ff, 0.4)
            .setScrollFactor(0).setDepth(1001);

        scene.input.on('pointerdown', p => this._down(p));
        scene.input.on('pointermove', p => this._move(p));
        scene.input.on('pointerup', p => this._up(p));
    }

    _down(p) {
        // Only activate joystick on left 45% of screen
        if (p.x < this.scene.cameras.main.width * 0.45 && this.pointerId === null) {
            this.active = true;
            this.pointerId = p.id;
            this.base.setPosition(p.x, p.y);
            this.thumb.setPosition(p.x, p.y);
        }
    }

    _move(p) {
        if (!this.active || p.id !== this.pointerId) return;
        const dx = p.x - this.base.x;
        const dy = p.y - this.base.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const max = this.baseR;

        if (dist > max) {
            this.thumb.setPosition(
                this.base.x + (dx / dist) * max,
                this.base.y + (dy / dist) * max
            );
        } else {
            this.thumb.setPosition(p.x, p.y);
        }

        const norm = Math.min(dist, max) / max;
        this.dir.x = (dx / Math.max(1, dist)) * norm;
        this.dir.y = (dy / Math.max(1, dist)) * norm;
    }

    _up(p) {
        if (p.id !== this.pointerId) return;
        this.active = false;
        this.pointerId = null;
        this.dir.x = 0;
        this.dir.y = 0;
        this.thumb.setPosition(this.base.x, this.base.y);
    }

    getDirection() {
        return this.dir;
    }

    setVisible(v) {
        this.base.setVisible(v);
        this.thumb.setVisible(v);
    }

    destroy() {
        this.base.destroy();
        this.thumb.destroy();
    }
}
