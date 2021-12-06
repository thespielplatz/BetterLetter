const fs = require('fs');

const SeedGenerator = require('./tools/Seed.js');

const Player = require('./game/Player.js');
const Dealer = require('./game/Dealer.js');
const Brains = require('./game/Brain.js');
const PlayerActionError = require('./game/PlayerActionError.js');
const AR = require('./game/AnimationRecorder.js').getSingleton();

const seedword = "LetterBots1"
const gen = new SeedGenerator(seedword);

const b = new Brains.OreganoBrain();
const p1 = new Player("Luxx", b, gen);
const p2 = new Player("Tom", b, gen);
const p3 = new Player("Fil", b, gen);

const dealer = new Dealer(gen);

dealer.addPlayer(p1);
dealer.addPlayer(p2);
dealer.addPlayer(p3);

let gameBroke = false;

console.log(`### Game Start with Seedword ${seedword}`);
dealer.start();

while (dealer.isGameRunning()) {
    dealer.logState();
    try {
        dealer.playTurn();
    } catch (e) {
        if (e instanceof PlayerActionError) {
            console.log("### Player Error");
            AR.error(e);
        } else {
            console.log("### Game Broke --> Exception");
            console.log(e);
            gameBroke = true;
        }

        console.log(e);

        break;
    }
}

if (gameBroke) {
    console.log("### Game Broke");

} else {
    console.log("### Game Ended");
    let winOrder = dealer.calculateWinners();
    console.log(winOrder);
    dealer.logState();
    console.log("### Game Log");
    dealer.logTurns();

    //let file = `./server/static/export/${seedword}.json`;
    let file = `./server/static/export/LetterBots.json`;

    let data = JSON.stringify(AR.export(), null, 4);
    fs.writeFileSync(file, data, (err) => {
        if (err) throw err;
        console.log('Data written to file');
    });

    console.log(`Data Exported to ${file}`);
}


