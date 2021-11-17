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
        this.killed = false;
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
    askAction(others, hand, turns) {
        const me = this.getPublicInfo();
        const action = this.brain.process(me, others, hand, turns);
        const definition = '| Definition: { card : (cardId,Int), on : (optional seatId:Int), has : (optional seatId:Int)}';

        if (!('card' in action)) throw new PlayerActionError(me, action, `{ card : MISSING } ${definition}`);

        // Todo: typecheck & valuecheck of action.card

        if ([1,2,3,5,6].indexOf(action.card) >= 0) {
            if (!('on' in action)) throw new PlayerActionError(me, action, `{ card : ${action.card}, on : MISSING } ${definition}`);

            // Todo: on me or not on me

            if (action.card === 1 && !('has' in action)) {
                throw new PlayerActionError(me, action, `{ card : ${action.card}, on : ${action.on}, has : MISSING } ${definition}`);
            }
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
            killed: this.killed,
            played: Array.from(this.played)
        };
    }

    log() {
        console.log(`Seat #${this.seat} ${this.name}\tHand: ${this.hand.toString()}\tPlayed: ${this.played.toString()}`);
    }
}

module.exports = Player;
