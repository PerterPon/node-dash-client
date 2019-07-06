
/*
 * util.ts
 * Author: 王 羽涵<perterpon.wang@bytedance.com>
 * Create: Thu Jul 04 2019 21:04:53 GMT+0800 (CST)
 */


export function sleep(time: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
}
