const PHASER_WIDTH = 1200, PHASER_HEIGTH = 800;
var config = {
    parent: 'full-height',

    // Game size
    width: PHASER_WIDTH,
    height: PHASER_HEIGTH,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: { // Minimum size
            width: 400,
            height: 300
        },
        max: { // Maximum size
            width: 1600,
            height: 1200
        },
        zoom: 1, // Size of game canvas = game size * zoom
    },
    autoRound: false,
    backgroundColor: 0x0c5d0c,
    transparent: true,

    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
let gamedata = undefined;
$.getJSON("static/export/LetterBots.json", function(json) {
    console.log(json); // this will show the info it in firebug console
});

function preload() {
    const back = new Button(this, 35, 20, 70, 30, "Back");
    const next = new Button(this, 115, 20, 70, 30, "Next");

    const turnText = this.add.text(0, 50, "Turn 1");

    this.load.image('back', './static/img/ll/back.jpg');
    this.load.image('1_guard', './static/img/ll/1_guard.jpg');
}

function create() {
    var image = this.add.image(200, 500, "back");
}

function update() {
}
