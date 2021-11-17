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



let gameBroke = false;

for (i = 0; i < 1000; i++) {
    console.log(`### Game Start ${i}`);
    dealer.start();

    while (dealer.isGameRunning()) {
        dealer.logState();
        try {
            dealer.playTurn();
        } catch (e) {
            console.log("### Game Broke");
            console.log(e);
            gameBroke = true;
            break;
        }
    }
    if (gameBroke) break;
}

if (gameBroke) {
    console.log("### Game Broke");

} else {
    console.log("### Game Ended");
    let winOrder = dealer.checkWin();
    console.log(winOrder);
    dealer.logState();
    console.log("### Game Log");
    dealer.logTurns();
}


