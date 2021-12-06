const Deck = require("./Deck.js");

class AnimationRecorder {
    // Singleton
    static singleton = null;

    static getSingleton() {
        if (AnimationRecorder.singleton === null) {
            AnimationRecorder.singleton = new AnimationRecorder();
        }

        return AnimationRecorder.singleton;
    }

    constructor() {
        this.animationCounter = 0;
        this.animationStack = [];
        this.turnAnimations = [];
        this.turns = [];
        this.players = [];
    }

    error(e) {
        this.animationStack.push({
            name: e.name,
            message: e.message,
            animation: "error",
            animationIndex: this.animationCounter++
        });
    }

    card(card) {
        this.animationStack.push(Object.assign({}, card, {
            animation: "card",
            animationIndex: this.animationCounter++
        }));
    }

    action(action, player) {
        this.animationStack.push(Object.assign({...player}, action, {
            animation: "action",
            animationIndex: this.animationCounter++
        }));
    }

    winner(winner) {
        this.animationStack.push(Object.assign({}, winner, {
            animation: "winner",
            animationIndex: this.animationCounter++
        }));
    }

    nextTurn() {
        this.turnAnimations.push(this.animationStack);
        this.animationStack = [];
        this.animationCounter = 0;
    }

    addTurnInfo(turn) {
        this.turns.push(turn);
    }

    addPlayer(p) {
        this.players.push(p);
    }

    export() {
        return {
            turns : this.turns,
            players: this.players,
            turnAnimations: this.turnAnimations
        }
    }
}

module.exports = AnimationRecorder;
