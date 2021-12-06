class Brain {
    /**
     * @param {Object} me
     * @param {Array} others
     * @param {Array} hand
     * @param {Array} turns
     * @return { card: Number, on: Number, has: Number }
     */
    process(me, others, hand, turns) {
        return {
            card: 1,
            on: 0,
            has: 8
        }
    }
}

module.exports = Brain;
