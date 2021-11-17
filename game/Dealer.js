// Deck
// 1: 5x Guard
// 2: 2x Priest
// 3: 2x Baron
// 4: 2x Maid
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

    prepare() {
        this.buildDeck();
        this.shuffleDeck();
    }

    start() {
        this.sidecard = this.deck.shift();

        this.players.forEach((p) => p.getCard(this.deck.shift()));
    }

    playTurn() {
        const activePlayer = this.players[this.getTurn() % (this.players.length)];
        activePlayer.getCard(this.deck.shift());

        let otherPlayers = this.players.filter(p => p.name !== activePlayer.name).map(p => p.getPublicInfo());

        const action = activePlayer.askAction(otherPlayers, Array.from(activePlayer.hand), Array.from(this.turns));
        console.log(`${activePlayer.name} played ${action.card}${('on' in action ? ` on ${this.players[action.on].name}` : '')}${('has' in action ? ` has ${action.has}` : '')}`);

        let turn = {
            ...action,
            turn: this.turns.length,
            seat: activePlayer.seat,
            name: activePlayer.name,
        };
        this.turns.push(turn);
    }

    isGameRunning() {
        if (this.deck.length <= 0) return false;
        if (this.players.every((p) => p.killed)) return false;

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
        this.turns.forEach((t) =>
            console.log(`Turn #${t.turn} ${t.name} played ${t.card}${('on' in t ? ` on ${this.players[t.on].name}` : '')}${('has' in t ? ` has ${t.has}` : '')}`)
        );
        console.log(``);
    }
}

module.exports = Dealer;
