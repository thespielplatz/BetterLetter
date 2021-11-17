console.log("main.js");

const SeedGenerator = require('./tools/Seed.js');

const Player = require('./game/Player.js');
const Dealer = require('./game/Dealer.js');
const Brains = require('./game/Brain.js');

const gen = new SeedGenerator("LetterBots");

const b = new Brains.OreganoBrain();
const p1 = new Player("Luxx", b, gen);
const p2 = new Player("Tom", b, gen);
const p3 = new Player("Fil", b, gen);

const dealer = new Dealer(gen);

dealer.addPlayer(p1);
dealer.addPlayer(p2);
dealer.addPlayer(p3);

dealer.prepare();
dealer.logState();
dealer.start();
dealer.logState();

while (dealer.isGameRunning()) {
    try {
        dealer.playTurn();
    } catch (e) {
        console.log(e);
        break;
    }
}

let winOrder = dealer.checkWin();
console.log("winOrder");
console.log(winOrder);

dealer.logState();
dealer.logTurns();
