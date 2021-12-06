const PlayerActionError = require('./PlayerActionError.js')
const Deck = require('./Deck.js')
const AR = require('./AnimationRecorder.js').getSingleton();

// Deck
// 1: 5x Guard
// 2: 2x Priest
// 3: 2x Baron
// 4: 2x Handmaid
// 5: 2x Prince
// 6: 1x King
// 7: 1x Countess
// 8: 1x Princess

class Dealer {
    /**
     * @param {SeedGenerator} seedGenerator The SeedGenerator
     */
    constructor(seedGenerator) {
        this.gen = seedGenerator
        this.deck = undefined;
        this.players = [];
        this.data = {};
        this.sidecard = undefined;
        this.internalPlayerIndex = 0;
        this.turnStates = [];
    }

    getTurn() {
        return this.data.turns.length;
    }

    /**
     * @param {Player} p a Player
     */
    addPlayer(p) {
        p.sitDown(this.players.length);
        this.players.push(p);
    }

    start() {
        this.data = {
            turns : [],
            players : [],
        };

        this.deck = new Deck();
        this.deck.build();
        this.deck.shuffle(this.gen);

        this.internalPlayerIndex = 0;

        this.sidecard = this.deck.shift().update("sidecard");

        this.players.forEach((p) => {
            p.reset();

            const startHand = this.deck.shift();
            p.getCard(startHand);

            let exportedPlayer = p.getPublicInfo();
            exportedPlayer.startHand = startHand.number;

            AR.addPlayer(exportedPlayer);
        });

        AR.nextTurn();
    }

    playTurn() {

        let activePlayer;
        let foundPlayer = false
        while (!foundPlayer) {
            activePlayer = this.players[this.internalPlayerIndex % (this.players.length)];
            if (!activePlayer.killed) break;
            this.internalPlayerIndex++;
        }
        this.internalPlayerIndex++;

        console.log(`Turn #${this.getTurn() + 1}: ${activePlayer.name}`);
        activePlayer.getCard(this.deck.shift());

        let otherPlayers = this.players.filter(p => p.name !== activePlayer.name).map(p => p.getPublicInfo());
        const nonChooseAble = otherPlayers.every((p) => p.killed || p.handMaide);
        if (nonChooseAble) console.log("Non Choose Able!");

        // Process Action
        const action = activePlayer.askAction(otherPlayers, Array.from(activePlayer.hand), Array.from(this.data.turns), nonChooseAble);

        if (nonChooseAble && action.card !== 5) {
            console.log(`${activePlayer.name} played ${action.card}`);
        } else {
            console.log(`${activePlayer.name} played ${action.card}${('on' in action ? ` on ${this.players[action.on].name}` : '')}${('has' in action ? ` has ${action.has}` : '')}`);

            // Check if target is suitable
            if ('on' in action) {
                if (this.players[action.on].killed) throw new PlayerActionError(activePlayer, action, `Choosen player (seat#${action.on}) is dead!`);
                if (this.players[action.on].handMaide) throw new PlayerActionError(activePlayer, action, `Choosen player (seat#${action.on}) is safe!`);
            }
        }

        if ('has' in action) {
            if (action.has < 2 || action.has > 8) throw new PlayerActionError(activePlayer, action, `A call is only valid 2 till 8 (You called: ${action.has})`);
        }

        // Resolve Turn
        let resolve = { action : "nothing"};
        let resolvingAction = action.card;

        if (nonChooseAble && [1,2,3,6].indexOf(resolvingAction) >= 0) {
            resolvingAction = -1;
        }

        switch (resolvingAction) {
            case 1:
                if (this.players[action.on].hand[0].is(action.has)) {
                    this.players[action.on].kill();
                    resolve.action = "kill";
                    resolve.seat = action.on;
                }
                break;

            case 2:
                activePlayer.savePriestLook(this.players[action.on].hand[0].number);
                resolve.action = "look";
                break;

            case 3:
                const aCard = activePlayer.hand[0].number;
                const oCard = this.players[action.on].hand[0].number;

                if (aCard == oCard) {
                    resolve = "nothing";
                }
                if (aCard > oCard) {
                    this.players[action.on].kill();
                    resolve.action = "kill";
                    resolve.seat = action.on;
                }
                if (aCard < oCard) {
                    activePlayer.kill();
                    resolve.action = "kill";
                    resolve.seat = activePlayer.seat;
                }
                break;

            case 4:
                activePlayer.saveHandmaide();
                break;

            case 5:
                if (this.players[action.on].hand[0].is(8)) {
                    this.players[action.on].kill();
                    resolve.action = "kill";
                    resolve.seat = action.on;

                } else {
                    this.players[action.on].playedCard(this.players[action.on].hand.pop());
                    if (this.deck.length == 0) {
                        this.players[action.on].getCard(this.sidecard);
                        this.sidecard = undefined;
                        resolve.action = "sidecard";

                    } else {
                        this.players[action.on].getCard(this.deck.shift());
                        resolve.action = "deckcard";
                    }
                }
                break;

            case 6:
                const cardA = activePlayer.hand.pop();
                const cardB = this.players[action.on].hand.pop();

                activePlayer.getCard(cardB);
                this.players[action.on].getCard(cardA);
                resolve.action = "switchedcards";
                break;

            case 8:
                activePlayer.kill();
                resolve.action = "kill";
                resolve.seat = activePlayer.seat;
                break;
        }

        console.log(`Resolve: ${JSON.stringify(resolve)}`);

        let turn = {
            ...action,
            turn: this.data.turns.length,
            seat: activePlayer.seat,
            name: activePlayer.name,
            resolve
        };

        this.data.turns.push(turn);
        AR.addTurnInfo(turn);

        AR.nextTurn();
    }

    isGameRunning() {
        if (this.deck.length() <= 0) return false;
        const alivePlayers = this.players.reduce((count, p) => {
            return count + (p.killed ? 0 : 1);
        }, 0);

        if (alivePlayers <= 1) return false;

        return true;
    }

    calculateWinners() {

        // Sort Players by last hand and killed
        let winOrder = this.players.map(p => {
            let player = { killed: p.killed, seat: p.seat, name: p.name};
            if (!p.killed) player.lastHand = p.hand[0];
            return player;

        }).sort((p1, p2) => {
            if (p1.killed && p2.killed) return 0;
            if (p1.killed) return 1;
            if (p2.killed) return -1;
            if (p1.lastHand == p2.lastHand) return 0;
            return p1.lastHand > p2.lastHand ? -1 : 1;
        });

        this.data.win = Array.from(winOrder);

        let bestHand = 0;

        this.data.win.forEach(p => {
            if (bestHand > p.lastHand) return;
            bestHand = p.lastHand;
            if (!p.killed) {
                AR.winner(p);
            }
        });

        return winOrder;
    }

    logState() {
        console.log(`Turn #${this.getTurn() + 1} ` +
            `Sidecard: ${this.sidecard ? this.sidecard.number : "none"} ` +
            `| Deck(${this.deck ? this.deck.cards.length : "No Deck"}) ` +
            `${this.deck ? this.deck.toString() : ""}`);
        this.players.forEach((p) => p.log());
        console.log(``);
    }

    logTurns() {
        this.data.turns.forEach((t) => {
            console.log(`Turn #${t.turn} ${t.name} played ${t.card}${('on' in t && t.on >= 0 ? ` on ${this.players[t.on].name}` : '')}${('has' in t ? ` has ${t.has}` : '')}`)
            console.log(`Resolve: ${JSON.stringify(t.resolve)}`);
        });
        console.log(``);
    }
}

module.exports = Dealer;
