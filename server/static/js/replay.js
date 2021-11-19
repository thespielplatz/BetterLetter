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
let scene = undefined;


function create() {
    scene = this;
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

let displaySort = [];
let cardIndex = 0;
let currentTurn = undefined;

function updateScene(scene) {
    console.log(`Update Scene | Turn #${turnCounter}`);
    currentTurn = gamedata.turnStates[turnCounter];

    // UI
    //backButton.visible = turnCounter !== 0;
    nextButton.visible = turnCounter < gamedata.turnStates.length - 1;

    // Animation Order
    currentTurn.cards = currentTurn.cards.sort((c1, c2) => {
        if (c1.animationIndex === c2.animationIndex) return 0;
        return c1.animationIndex > c2.animationIndex ? 1 : -1;
    });

    // Sorting
    displaySort = [];

    cardIndex = 0;
    processCard();
}

let extraStep = false;
function processCard() {
    if (cardIndex >= currentTurn.cards.length) {
        return;
    }

    const c = currentTurn.cards[cardIndex];
    cardIndex++;

    let card = getCard(c.id);
    scene.children.bringToTop(card);

    let where = c.where;
    let x, y;
    let number = c.number;
    let animation = c.lastWhere != c.where;

    if (extraStep) {
        extraStep = false;
    } else {
        if (c.lastWhere == "deck" && c.where == "played") {
            where = "hand";
            cardIndex--;
            extraStep = true;
        }
    }

    if (animation) console.log(c);
    switch(where) {
        case "deck":
            x = Pdeck.x + Pdeck.dx * c.index;
            y = Pdeck.y + Pdeck.dy * c.index;
            number = 0;
            displaySort.push({ index: c.index, card: card });
            break;

        case "sidecard":
            x = Psidecard.x;
            y = Psidecard.y;
            break;

        case "hand":
            x = rectPlayer.getX(c.seat);
            y = rectPlayer.y;
            break;

        case "played":
            x = rectPlayer.getX(c.seat) + (rectCard.w - rectPlayer.w) * 0.5 + rectCard.w * 0.5 * c.index;
            y = rectPlayer.y - rectPlayer.h;
            break;
    }

    animateCard(card, number, x, y, animation);
}

function animateCard(card, number, x, y, animation) {
    changeCard(card, number);

    if (animation === false) {
        card.setPosition(x, y);
        processCard();
        return;
    }

    var tween = scene.tweens.add({
        targets: card,
        x: x,
        y: y,
        ease: 'Cubic',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
        duration: 500,
        repeat: 0,            // -1: infinity
        yoyo: false
    });
    setTimeout(processCard, 500);
}

function updateSceneFinished() {
    // Set Display index
    displaySort.sort((c1, c2) => {
        if (c1.index === c2.index) return 0;
        return c1.index > c2.index ? 1 : -1;
    }).forEach((card) => scene.children.bringToTop(card.card));
}
