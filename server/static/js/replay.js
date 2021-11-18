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
let turnCounter = 0;

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

let backButton, nextButton;

function preload() {
    const scene = this;

    backButton = new Button(this, 35, 50, 70, 30, "Back");
    backButton.visible = false;
    nextButton = new Button(this, 115, 50, 70, 30, "Next");
    nextButton.visible = false;

    nextButton.on("pointerdown", () => {
        turnCounter++;
        updateScene(scene);
    });

    backButton.on("pointerdown", () => {
        turnCounter--;
        updateScene(scene);
    });

    cardimages.forEach(config => {this.load.image(config.texture, config.path);});
}
function changeCard(image, card) {
    image.setTexture(cardimages[card].texture);
}

let cards = [];
let sidecard;
let Pdeck = { x: 600, y: 130, dx : 1, dy : 1};
let Psidecard = { x: 800, y: Pdeck.y };
let rectCard = { w: 0, h: 0 }

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
        cards.push(new Card(this, Pdeck.x + Pdeck.dx * i, Pdeck.y + Pdeck.dy * i).setData("cardId", i));
    }

    rectCard.w = cards[0].displayWidth;
    rectCard.h = cards[0].displayHeight;
}

function update() {
}

let rectPlayer = {
    margin: 100,
    w: 300,
    h: 180,
    mYName : 120,
    getX: (seat) => {
        return rectPlayer.x + (rectPlayer.spacing + rectPlayer.w) * seat;
    }
};

function start(scene) {
    // update turn data

    // Players
    let playerCount = gamedata.players.length;
    rectPlayer.spacing = (scene.sys.game.scale.gameSize.width - 2 * rectPlayer.margin - playerCount * rectPlayer.w) / (playerCount - 1);
    rectPlayer.y = scene.sys.game.scale.gameSize.height - rectPlayer.h;
    rectPlayer.x = rectPlayer.margin + rectPlayer.w * 0.5
    console.log(rectPlayer);

    // Player Setup
    gamedata.players.forEach(p => {
        scene.add.rectangle(rectPlayer.getX(p.seat), rectPlayer.y, rectPlayer.w, rectPlayer.h, 0xFFFFFF, 0.3).setStrokeStyle(2, 0xFFFFFF, 1.0);
        scene.add.text(rectPlayer.getX(p.seat), rectPlayer.y + rectPlayer.mYName, p.name, { fontFamily: 'Bebas Neue', fontSize: '25px' }).setOrigin(0.5);
    });

    // Cards & UI
    updateScene(scene);
}

function getCard(id) {
    for (let i = 0; i < cards.length; ++i) {
        const card = cards[i];
        if (card.getData("cardId") == id) return card;
    }

    return undefined;
}

function updateScene(scene) {
    const turn = gamedata.turnStates[turnCounter];
    // UI
    backButton.visible = turnCounter !== 0;
    nextButton.visible = turnCounter < gamedata.turnStates.length - 1;

    // Cards
    turn.cards.forEach((c) => {
        let card = getCard(c.id);
        scene.children.bringToTop(card);

        switch(c.where) {
            case "deck":
                changeCard(card, 0);
                card.setPosition(Pdeck.x + Pdeck.dx * c.index, Pdeck.y + Pdeck.dy * c.index);
                break;

            case "sidecard":
                changeCard(card, c.number);
                card.setPosition(Psidecard.x, Psidecard.y);
                break;

            case "hand":
                changeCard(card, c.number);
                card.setPosition(rectPlayer.getX(c.seat), rectPlayer.y);
                break;

            case "played":
                changeCard(card, c.number);
                card.setPosition(rectPlayer.getX(c.seat) + (rectCard.w - rectPlayer.w) * 0.5 +  +
                    rectCard.w * 0.5 * c.index,
                    rectPlayer.y - rectPlayer.h);
                break;

        }
    });
}
