class Card extends Phaser.GameObjects.Image {
    constructor(scene, x, y) {
        const texture = "back";
        super(scene, x, y, texture);
        scene.add.existing(this);
        this.setScale(0.5, 0.5);
    }
}
