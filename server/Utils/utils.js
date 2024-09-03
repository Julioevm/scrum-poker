"use strict";
exports.__esModule = true;
exports.log = void 0;
function log(message) {
    var develop = process.env.NODE_ENV === "develop";
    develop && console.log(message);
}
exports.log = log;
