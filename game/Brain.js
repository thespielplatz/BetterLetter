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
        let saveChoices = others.reduce((prev, p) => {
            if (!p.killed && !p.handMaide) prev.push(p.seat);
            return prev;
            }, []);

        console.log(`Others: ${JSON.stringify(others)}`);
        console.log(`saveChoices: ${JSON.stringify(saveChoices)}`);

        // Countess
        if (hand.indexOf(7) >= 0 && (hand.indexOf(5) >= 0 || hand.indexOf(6) >= 0 )) {
            return { card : 7 };
        };

        // Princess
        const hasPrincess = hand.indexOf(8);

        // Random
        const handIndex = Math.floor(Math.random() * 2);
        const card = (hasPrincess >= 0? hand[hasPrincess == 0 ? 1 : 0] : hand[handIndex]);

        if (card == 5) {
            saveChoices.push(me.seat);
        }
        const randomSeat = (saveChoices.length == 0 ? -1 : saveChoices[Math.floor(Math.random() * saveChoices.length)]);

        switch (card) {
            case 1:
                return { card : card,  on : randomSeat, has : Math.floor(Math.random() * 8) + 1};

            case 2:
            case 3:
            case 6:
                return { card : card,  on : randomSeat};

            case 5:
                return { card : card,  on : randomSeat};

            default:
                return { card : card };
        }
    }
}


module.exports = {
    Brain,
    OreganoBrain
};
