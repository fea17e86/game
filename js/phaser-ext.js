if (Phaser) {
    Phaser.Game.prototype.resize = function (width, height) {
        if (!isNaN(width) && !isNaN(height) && (this.width !== width || this.height !== height)) {
            this.width = width;
            this.height = height;
            this.world.setBounds(0, 0, width, height);
            this.camera.setSize(width, height);
            this.camera.setBoundsToWorld();
            if (this.renderType === Phaser.WEBGL) {
                this.renderer.resize(width, height);
            }
        }
    };
}