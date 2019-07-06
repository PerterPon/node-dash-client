"use strict";
/*
 * util.ts
 * Author: 王 羽涵<perterpon.wang@bytedance.com>
 * Create: Thu Jul 04 2019 21:04:53 GMT+0800 (CST)
 */
Object.defineProperty(exports, "__esModule", { value: true });
function sleep(time) {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
}
exports.sleep = sleep;
