const PlayerActionError = require('./PlayerActionError.js')

class Player {
    /**
     * @param {string} name The name of the player
     * @param {Brain} brain The Brain of the player
     * @param {SeedGenerator} seedGenerator The SeedGenerator
     */
    constructor(name, brain, seedGenerator) {
        this.name = name;
        this.brain = brain;
        this.gen = seedGenerator;
        this.seat = -1;
        this.points = 0;

        this.reset();
    }

    reset() {
        this.hand = [];
        this.played = [];
    }

    sitDown(seat) {
        this.seat = seat;
    }

    getCard(c) {
        this.hand.push(c);
    }
    /**
     * @param {Player} me
     * @param {Array} others
     * @param {Array} hand
     * @param {Array} turns
     * @return { card: Number, call: String }
     */
    askAction(me, others, hand, turns) {
        const action = this.brain.process(me, others, hand, turns);

        if (!('card' in action)) new PlayerActionError(me, `Return has no "card" { card : (Int), call : (optional:String) }`);

        // Todo: typecheck & valuecheck of action.card

        if ([1,2,3,5,6].indexOf(action.card) >= 0) {
            if (!('call' in action)) new PlayerActionError(me, `Return card(${action.card}) no { card : (Int), call : (String) }`)
        }

        // Todo: typecheck & valuecheck of action.call

        this.played.push(action.card);
        this.hand.splice(this.hand.indexOf(action.card),1);

        return action;
    }


    getPublicInfo() {
        return {
            name: this.name,
            points: this.points,
            seat: this.seat,
            played : Array.from(this.played)
        };
    }

    log() {
        console.log(`Name #${this.name}\tHand: ${this.hand.toString()}\tPlayed: ${this.played.toString()}`);
    }
}

module.exports = Player;
