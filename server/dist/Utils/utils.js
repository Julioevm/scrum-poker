"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
function log(message) {
    const develop = process.env.NODE_ENV === "develop";
    develop && console.log(message);
}
exports.log = log;
