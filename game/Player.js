const PlayerActionError = require('./PlayerActionError.js')
const Deck = require('./Deck.js')
const AR = require('./AnimationRecorder.js').getSingleton();

class Player {
    /**
     * @param {string} name The name of the player
     * @param {Brain} brain The Brain of the player
     */
    constructor(name, brain) {
        this.name = name;
        this.brain = brain;
        this.seat = -1;
        this.points = 0;

        this.reset();
    }

    reset() {
        this.hand = [];
        this.played = [];
        this.killed = false;
        this.handMaide = false;
        this.priest = undefined;
    }

    sitDown(seat) {
        this.seat = seat;
    }

    getCard(c) {
        this.hand.push(c.update("hand", this.seat, this.hand.length));
    }

    removeHandCardByNumber(number) {
        const result = Deck.findAndSplice(this.hand, number);
        this.hand = result.result;
        return result.splice;
    }

    playedCard(c) {
        this.played.push(c.update("played", this.seat, this.played.length));
    }
    /**
     * @param {Player} me
     * @param {Array} others
     * @param {Array} hand
     * @param {Array} turns
     * @param {boolean} nonChooseAble
     * @return { card: Number, call: String }
     */
    askAction(others, hand, turns, nonChooseAble) {
        this.handMaide = false;

        const definition = '| Definition: { card : (cardId,Int), on : (optional seatId:Int), has : (optional seatId:Int)}';
        const me = this.getPublicInfo();
        if (this.priest !== undefined) {
            me.priest = this.priest;
            this.priest = undefined;
        }

        // Get Player Action
        const action = this.brain.process(me, others, Deck.toNumbers(hand), turns);

        // Check action.card
        if (!('card' in action)) throw new PlayerActionError(me, action, `{ card : MISSING } ${definition}`);
        const cardType = typeof action.card;
        if (!(cardType !== "Number")) throw new PlayerActionError(me, action, `{ card : not Number } it is ${cardType} ${definition}`);

        // Check action.on
        const oncards = [5];
        if (!nonChooseAble) oncards.push(1,2,3,6)
        if (oncards.indexOf(action.card) >= 0) {
            if (!('on' in action)) throw new PlayerActionError(me, action, `{ card : ${action.card}, on : MISSING } ${definition}`);
            const onType = typeof action.on;
            if (!(onType !== "Number")) throw new PlayerActionError(me, action, `{ on : not a Number } it is ${onType} ${definition}`);
        }

        // Check action.has
        if (!nonChooseAble && action.card === 1) {
            if (!('has' in action)) throw new PlayerActionError(me, action, `{ card : ${action.card}, on : ${action.on}, has : MISSING } ${definition}`);
            const hasType = typeof action.has;
            if (!(hasType !== "Number")) throw new PlayerActionError(me, action, `{ has : not a Number } it is ${hasType} ${definition}`);
        }

        AR.action(action, this.getPublicInfo());

        // Playing Card
        const card = this.removeHandCardByNumber(action.card);
        if (card === undefined) throw new PlayerActionError(me, action, "Could not found chosen card!");
        this.playedCard(card);

        return action;
    }

    saveHandmaide() {
        this.handMaide = true;
    }

    savePriestLook(card) {
        this.priest = card;
    }

    kill() {
        this.killed = true;
        if (this.hand.length >= 1) this.playedCard(this.hand.pop());
    }

    getPublicInfo() {
        return {
            name: this.name,
            points: this.points,
            seat: this.seat,
            killed: this.killed,
            handMaide : this.handMaide,
            played: Deck.toNumbers(this.played)
        };
    }

    log() {
        console.log(`Seat #${this.seat} ${this.name} ` +
        `\tHand: ${Deck.toNumbers(this.hand).toString()} ` +
        `\tPlayed: ${Deck.toNumbers(this.played).toString()} ` +
        `\t${this.handMaide ? "Handmaide" : ""}${this.killed ? "dead" : ""}`);
    }
}

module.exports = Player;
