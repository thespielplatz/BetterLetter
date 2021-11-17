class Brain {
    /**
     * @param {Player} me
     * @param {Array} others
     * @param {Array} hand
     * @param {Array} turns
     * @return { card: Number, call: String }
     */
    process(me, others, hand, turns) {

    }
}

class OreganoBrain extends Brain {
    process(me, others, hand, turns) {
        // Countess
        if (hand.indexOf(7) >= 0 && (hand.indexOf(5) >= 0 || hand.indexOf(6) >= 0 )) {
            console.log("Choosing 7")
            return { card : 7 };
        };

        // Princess
        const hasPrincess = hand.indexOf(8);

        // Random
        const handIndex = Math.floor(Math.random() * 2);
        const card = (hasPrincess ? hand[hasPrincess == 0 ? 1 : 0] : hand[handIndex]);
        console.log("Choosing " + card)

        // Todo: check for 4: Maid
        const otherIndex = Math.floor(Math.random() * others.length);

        switch (card) {
            case 1:
                return { card : card,  on : others[otherIndex].seat, has : Math.floor(Math.random() * 8) + 1};

            case 2:
            case 3:
            case 6:
                return { card : card,  on : others[otherIndex].seat};

            case 5:
                // Todo: check for 4: Maid
                const allPlayers = [me, ...others];
                const allIndex = Math.floor(Math.random() * allPlayers.length);
                return { card : card,  on : allPlayers[allIndex].seat};

            default:
                return { card : card };
        }
    }
}


module.exports = {
    Brain,
    OreganoBrain
};
