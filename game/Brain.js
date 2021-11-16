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
            return { card : 7 };
        };

        // Princess
        let hasPrincess = hand.indexOf(8);
        if (hasPrincess >= 0) {
            return { card : hand[hasPrincess == 0 ? 1 : 0] };
        }

        // Random
        const handIndex = Math.floor(Math.random() * 2);
        const card = hand[handIndex];

        switch (card) {
            case 1:
            case 2:
            case 3:
            case 6:
                // Todo: check for 4: Maid
                const otherIndex = Math.floor(Math.random() * others.length);
                return { card : card,  call : others[otherIndex].name};

            case 5:
                // Todo: check for 4: Maid
                const allPlayers = [me, ...others];
                const allIndex = Math.floor(Math.random() * allPlayers.length);
                return { card : card,  call : allPlayers[allIndex].name};

            default:
                return { card : card };
        }
    }
}


module.exports = {
    Brain,
    OreganoBrain
};
