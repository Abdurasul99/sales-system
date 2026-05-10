// utils.js

exports.isEmpty = function (value) {
    if (value === '' || value === null || value === undefined ||
        (typeof value === 'object' && !Object.keys(value).length)) {
        return true;
    }
    return false;
};

exports.isNull = function (value) {
    return value === null || value === undefined;
};

exports.numberPad = function (n, width) {
    n = String(n);
    return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
};

exports.getCurrentTime = function () {
    const date = new Date();
    return date.getFullYear() + '-' +
        this.numberPad(date.getMonth() + 1, 2) + '-' +
        this.numberPad(date.getDate(), 2) + ' ' +
        this.numberPad(date.getHours(), 2) + ':' +
        this.numberPad(date.getMinutes(), 2) + ':' +
        this.numberPad(date.getSeconds(), 2);
};

/**
 * Standard JSON envelope shared by every endpoint.
 * code:
 *   "0000" — success
 *   "8001" — missing required fields
 *   "8002" — entity not found
 *   "8011" — duplicate / conflict
 *   "8012" — operation failed
 *   "401"  — token expired
 *   "402"  — unauthorized
 *   "403"  — not logged in
 *   "9999" — unhandled exception
 */
exports.envelope = function ({ code = '0000', message = 'success', additionalMessage = '', body = null } = {}) {
    return {
        code,
        message,
        additionalMessage,
        responseTime: exports.getCurrentTime(),
        body,
    };
};
