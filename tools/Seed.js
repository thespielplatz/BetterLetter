// Source: https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript/47593316#47593316

class SeedGenerator {
    constructor(seedword) {
        // xmur3 generator
        let h = 1779033703 ^ seedword.length;
        for (let i = 0; i < seedword.length; i++) {
            h = Math.imul(h ^ seedword.charCodeAt(i), 3432918353);
            h = h << 13 | h >>> 19;
        }

        this.xmur3 = function() {
            h = Math.imul(h ^ h >>> 16, 2246822507);
            h = Math.imul(h ^ h >>> 13, 3266489909);
            return (h ^= h >>> 16) >>> 0;
        }
    }

    seed() {
        return this.xmur3() / (Math.pow(2, 32) - 1);
    }

    randomInt(max) {
        return Math.floor(this.seed() * max);
    }
}

module.exports = SeedGenerator;
