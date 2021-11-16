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

        const action = activePlayer.askAction(activePlayer.getPublicInfo(), otherPlayers, Array.from(activePlayer.hand), Array.from(this.turns));
        console.log(`${activePlayer.name} played ${action.card}${('call' in action ? ` on ${action.call}` : '')}`);

        let turn = {
            turn: this.turns.length,
            name: activePlayer.name,
            ...action
        };
        this.turns.push(turn);
    }

    logState() {
        console.log(`Turn #${this.getTurn() + 1} Sidecard: ${this.sidecard ? this.sidecard : "none"} | Deck(${this.deck ? this.deck.length : "No Deck"}) ${this.deck ? this.deck.toString() : ""}`);
        this.players.forEach((p) => p.log());
        console.log(``);
    }

    logTurns() {
        this.turns.forEach((t) => console.log(`Turn #${t.turn} ${t.name} played ${t.card}${('call' in t ? ` on ${t.call}` : '')}`));
        console.log(``);
    }
}

module.exports = Dealer;
