const AR = require('./AnimationRecorder.js').getSingleton();

class Card {
    /**
     * @param {Number} id The value of the card
     * @param {Number} number The value of the card
     * @param {String} where Where is the card
     * @param {Number} index index depending on the where
     */
    constructor(id, number, where, index) {
        this.id = id;
        this.number = number;
        this.where = where;
        this.index = index;
        this.seat = -1;

        this.lastSeat = this.seat;
        this.lastWhere = this.where;
        this.lastIndex = this.index;

        AR.card(this);
    }

    /**
     * @param {String} where Where is the card
     * @param {Number} seat Player Seat
     * @param {Number} index index depending on the where
     */
    update(where, seat, index) {
        this.lastSeat = this.seat;
        this.lastWhere = this.where;
        this.lastIndex = this.index;

        this.seat = seat;
        this.where = where;
        this.index = index;

        AR.card(this);

        return this;
    }

    /**
     * @param {Card|Number} o The other card to compare
     */
    is(o) {
        if (typeof o === "number") return this.number === o;
        return this.number === o.number;
    }
}

class Deck {
    static Card = Card;

    constructor() {
        this.cards = [];
        this.allCards = [];
    }

    build() {
        this.cards = new Array(16).fill(0).map((element, i) => {
            let number = 1;
            switch (i) {
                case 5:
                case 6: number = 2; break;
                case 7:
                case 8: number = 3; break;
                case 9:
                case 10: number = 4; break;
                case 11:
                case 12: number = 5; break;
                case 13: number = 6; break;
                case 14: number = 7; break;
                case 15: number = 8; break;
            }
            const card = new Card(i, number, "deck", i);
            this.allCards.push(card);
            return card;
        });
    }
    /**
     * @param {SeedGenerator} seedGenerator The SeedGenerator
     */
    shuffle(gen) {
        let m = this.cards.length;
        let i, t;

        // While there remain elements to shuffle…
        while (m) {
            // Pick a remaining element…
            i = Math.floor(gen.seed() * m--);        // <-- MODIFIED LINE

            // And swap it with the current element.
            t = this.cards[m];
            this.cards[m] = this.cards[i];
            this.cards[i] = t;
        }

        // Rebuild displayindex
        this.cards.forEach((c, i) => c.index = this.cards.length - 1 - i);
    }

    shift() {
        return this.cards.shift();
    }

    length() {
        return this.cards.length;
    }

    toString() {
        return Deck.toNumbers(this.cards);
    }

    static toNumbers(cards) {
        return cards.map(c => c.number);
    }

    static findAndSplice(cards, number) {
        let result = [];
        let slice = undefined;

        cards.forEach((c, i) => {
            if (slice !== undefined || !c.is(number)) {
                result.push(c);
            } else {
                slice = c;
            }
        });

        // Update Index of Cards
        result.forEach((c, i) => c.index = i);

        return {
            result: result,
            splice: slice
        }
    }
}

module.exports = Deck;
