class PlayerActionError extends Error {
    constructor(player, action, ...params) {
        super(...params);

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, PlayerActionError)
        }

        this.name = 'PlayerActionError';
        this.message += `\nReturn: ${JSON.stringify(action)}`;
    }
}

module.exports = PlayerActionError;
