const fs = require('fs');

const Player = require('./game/Player.js');
const Dealer = require('./game/Dealer.js');
const OreganoBrain = require('./game/brains/OreganoBrain.js');
const PlayerActionError = require('./game/PlayerActionError.js');
const AR = require('./game/AnimationRecorder.js').getSingleton();

const seedword = "LetterBots1"

const brain = new OreganoBrain();
const p1 = new Player("Luxx", brain);
const p2 = new Player("Tom", brain);
const p3 = new Player("Fil", brain);

const dealer = new Dealer(seedword);

dealer.addPlayer(p1);
dealer.addPlayer(p2);
dealer.addPlayer(p3);

let gameBroke = false;

console.log(`### Game Start with Seedword ${seedword}`);
dealer.start();
console.log(`\n`);

while (dealer.isGameRunning()) {
    try {
        dealer.logState();
        dealer.playTurn();
        console.log(`\n`);

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

    let winningCard = 1;
    winOrder.forEach(p => {
        let state = ("lastHand" in p ? `Hand: ${p.lastHand}` : `killed:${p.killed}`);
        console.log(`${p.winner ? "WIN " : "LOST"} Seat:${p.seat} ${p.name} ${state}`);
    });

    console.log(`\n`);
    console.log("### Game Export");

    //let file = `./server/static/export/${seedword}.json`;
    let file = `./server/static/export/LetterBots.json`;

    let data = JSON.stringify(AR.export(), null, 4);
    fs.writeFileSync(file, data, (err) => {
        if (err) throw err;
        console.log('Data written to file');
    });

    console.log(`Data Exported to ${file}`);
}


