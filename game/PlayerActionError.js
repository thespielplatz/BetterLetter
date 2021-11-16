class PlayerActionError extends Error {
    constructor(player, ...params) {
        super(...params);

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, PlayerActionError)
        }

        this.name = 'PlayerActionError';
    }
}

module.exports = PlayerActionError;
