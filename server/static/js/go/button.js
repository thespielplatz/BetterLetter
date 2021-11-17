class Button extends Phaser.GameObjects.Container {
    constructor(scene, x, y, w, h, text) {
        super(scene, x, y);
        const go = this;

        scene.add.existing(this);
        let interactive = this.setInteractive(new Phaser.Geom.Rectangle(-w * 0.5, -h * 0.5, w, h), Phaser.Geom.Rectangle.Contains);

        let a = scene.add.rectangle(0, 0, w, h, 0xfcba03);
        let b = scene.add.rectangle(0, 0, w - 6, h - 6, 0x804800);
        let t = scene.add.text(0,0,text);
        t.setOrigin(0.5,0.5);
        go.add(a);
        go.add(b);
        go.add(t);

        go.on("pointerover", function () {
            go.emit("VISUAL_STATE_CHANGE", "over");
        });
        go.on("pointerout", function () {
            go.emit("VISUAL_STATE_CHANGE", "normal");
        });

        go.on("VISUAL_STATE_CHANGE", (state) => {
            switch(state) {
                case "normal":
                    a.fillColor = 0xfcba03;
                    b.fillColor = 0x804800;
                    break;

                case "over":
                    a.fillColor = 0xfcf403;
                    b.fillColor = 0x806b00;
                    break;

            }
        });
    }
/*
    preUpdate(time, delta) {
        if (super.preUpdate) {
            super.preUpdate(time, delta);
        }
    }

 */
}
