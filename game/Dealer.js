const PlayerActionError = require('./PlayerActionError.js')

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
        this.turns = [];
        this.sidecard = undefined;
        this.internalPlayerIndex = 0;
    }

    getTurn() {
        return this.turns.length;
    }

    buildDeck() {
        this.deck = new Array(16);
        this.deck.fill(1);
        this.deck.fill(2, 5, 7);
        this.deck.fill(3, 7, 9);
        this.deck.fill(4, 9, 11);
        this.deck.fill(5, 11, 13);
        this.deck[13] = 6;
        this.deck[14] = 7;
        this.deck[15] = 8;
    }

    shuffleDeck() {
        let m = this.deck.length;
        let i, t;

        // While there remain elements to shuffle…
        while (m) {

            // Pick a remaining element…
            i = Math.floor(this.gen.seed() * m--);        // <-- MODIFIED LINE

            // And swap it with the current element.
            t = this.deck[m];
            this.deck[m] = this.deck[i];
            this.deck[i] = t;
        }
    }

    /**
     * @param {Player} p a Player
     */
    addPlayer(p) {
        p.sitDown(this.players.length);
        this.players.push(p);
    }

    start() {
        this.buildDeck();
        this.shuffleDeck();
        this.internalPlayerIndex = 0;

        this.sidecard = this.deck.shift();

        this.players.forEach((p) => {
            p.reset();
            p.getCard(this.deck.shift());
        });
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

        activePlayer.getCard(this.deck.shift());

        let otherPlayers = this.players.filter(p => p.name !== activePlayer.name).map(p => p.getPublicInfo());
        const nonChooseAble = otherPlayers.every((p) => p.killed || p.handMaide);
        if (nonChooseAble) console.log("Non Choose Able!");

        const action = activePlayer.askAction(otherPlayers, Array.from(activePlayer.hand), Array.from(this.turns), nonChooseAble);

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

        // Resolve Turn
        let resolve = { action : "nothing"};
        let resolvingAction = action.card;

        if (nonChooseAble && [1,2,3,6].indexOf(resolvingAction) >= 0) {
            resolvingAction = -1;
        }

        switch (resolvingAction) {
            case 1:
                if (this.players[action.on].hand[0] == action.has) {
                    this.players[action.on].kill();
                    resolve.action = "kill";
                    resolve.seat = action.on;
                }
                break;

            case 2:
                activePlayer.savePriestLook(this.players[action.on].hand[0]);
                resolve.action = "look";
                break;

            case 3:
                if (activePlayer.hand[0] == this.players[action.on].hand[0]) {
                    resolve = "nothing";
                }
                if (activePlayer.hand[0] > this.players[action.on].hand[0]) {
                    this.players[action.on].kill();
                    resolve.action = "kill";
                    resolve.seat = action.on;
                }
                if (activePlayer.hand[0] < this.players[action.on].hand[0]) {
                    activePlayer.kill();
                    resolve.action = "kill";
                    resolve.seat = activePlayer.seat;
                }
                break;

            case 4:
                activePlayer.saveHandmaide();
                break;

            case 5:
                if (this.players[action.on].hand[0] == 8) {
                    this.players[action.on].kill();
                    resolve.action = "kill";
                    resolve.seat = action.on;

                } else {
                    this.players[action.on].played.push(this.players[action.on].hand.pop());
                    if (this.deck.length == 0) {
                        this.players[action.on].hand.push(this.sidecard);
                        resolve.action = "sidecard";

                    } else {
                        this.players[action.on].hand.push(this.deck.shift());
                        resolve.action = "deckcard";
                    }
                }
                break;

            case 6:
                const cardA = activePlayer.hand.pop();
                const cardB = this.players[action.on].hand.pop();

                activePlayer.hand.push(cardB);
                this.players[action.on].hand.push(cardA);
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
            turn: this.turns.length,
            seat: activePlayer.seat,
            name: activePlayer.name,
            resolve
        };

        this.turns.push(turn);
    }

    isGameRunning() {
        if (this.deck.length <= 0) return false;
        const alivePlayers = this.players.reduce((count, p) => {
            return count + (p.killed ? 0 : 1);
        }, 0);

        if (alivePlayers <= 1) return false;

        return true;
    }

    checkWin() {
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

        return winOrder;
    }

    logState() {
        console.log(`Turn #${this.getTurn() + 1} Sidecard: ${this.sidecard ? this.sidecard : "none"} | Deck(${this.deck ? this.deck.length : "No Deck"}) ${this.deck ? this.deck.toString() : ""}`);
        this.players.forEach((p) => p.log());
        console.log(``);
    }

    logTurns() {
        this.turns.forEach((t) => {
            console.log(`Turn #${t.turn} ${t.name} played ${t.card}${('on' in t && t.on >= 0 ? ` on ${this.players[t.on].name}` : '')}${('has' in t ? ` has ${t.has}` : '')}`)
            console.log(`Resolve: ${JSON.stringify(t.resolve)}`);
        });
        console.log(``);
    }
}

module.exports = Dealer;
