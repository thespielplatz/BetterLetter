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
    backgroundColor: 0x0b6000,
    transparent: true,

    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

let gamedata = undefined;
let turnText = undefined;
let turn = 0;

let cardimages = [
    { texture: 'back', path: './static/img/ll/back.jpg' },
    { texture: '1_guard', path: './static/img/ll/1_guard.jpg' },
    { texture: '2_priest', path: './static/img/ll/2_priest.jpg' },
    { texture: '3_baron', path: './static/img/ll/3_baron.jpg' },
    { texture: '4_handmaid', path: './static/img/ll/4_handmaid.jpg' },
    { texture: '5_prince', path: './static/img/ll/5_prince.jpg' },
    { texture: '6_king', path: './static/img/ll/6_king.jpg' },
    { texture: '7_countess', path: './static/img/ll/7_countess.jpg' },
    { texture: '8_princess', path: './static/img/ll/8_princess.jpg' },
];
function preload() {
    const back = new Button(this, 35, 50, 70, 30, "Back");
    back.visible = false;
    const next = new Button(this, 115, 50, 70, 30, "Next");
    next.visible = false;

    cardimages.forEach(config => {this.load.image(config.texture, config.path);});
}
function changeCard(image, card) {
    image.setTexture(cardimages[card].texture);
}

let deck = [];
let sidecard;
let Ydeck = 130;
let Psidecard = { x: 800, y: Ydeck };

function create() {
    const scene = this;
    turnText = this.add.text(0, 10, "Loading Data ...");

    $.getJSON("static/export/LetterBots.json", function(json) {
        gamedata = json;
        start(scene);
    });

    turnText.text = "Setting Table Up ...";

    this.add.text(Psidecard.x, 20, "SIDECARD", { fontFamily: 'Bebas Neue', fontSize: '25px' }).setOrigin(0.5);
    this.add.rectangle(Psidecard.x, Psidecard.y, 140, 180, 0xFFFFFF, 0.3).setStrokeStyle(2, 0xFFFFFF, 1.0);

    for (let i = 0; i < 16; i++) {
        deck.push(new Card(this, 600+i, Ydeck+i));
    }

}

function update() {
}

function start(scene) {
    // update turn data

    // Players
    let playerCount = gamedata.players.length;
    const r = {
        m: 100,
        w: 300,
        h: 180,
        mYName : 120
    };
    r.s = (scene.sys.game.scale.gameSize.width - 2 * r.m - playerCount * r.w) / (playerCount - 1);
    r.y = scene.sys.game.scale.gameSize.height - r.h;
    r.x = r.m + r.w * 0.5

    gamedata.players.forEach(p => {
        scene.add.rectangle(r.x, r.y, r.w, r.h, 0xFFFFFF, 0.3).setStrokeStyle(2, 0xFFFFFF, 1.0);
        scene.add.text(r.x, r.y + r.mYName, p.name, { fontFamily: 'Bebas Neue', fontSize: '25px' }).setOrigin(0.5);

        let starthand = deck.pop();
        starthand.setPosition(r.x, r.y);
        changeCard(starthand, gamedata.turnStates[0]["hands"][p.seat][0]);
        scene.children.bringToTop(starthand);
        r.x += r.s + r.w;
    });

    // Sidecard
    sidecard = deck.pop();
    sidecard.setPosition(Psidecard.x, Psidecard.y);
    changeCard(sidecard, gamedata.sidecard);
}
