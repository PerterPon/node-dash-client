"use strict";
/*
 * index.ts
 * Author: PerterPon<perterpon@gmail.com>
 * Create: Thu Jul 04 2019 16:31:44 GMT+0800 (CST)
 */
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const request = require("request-promise");
const util_1 = require("src/util");
const mpd = require("src/mpd");
class NodeDashClient {
    constructor(options) {
        this.pooling = false;
        this.options = options;
        this.checkOptions(options);
    }
    async init() {
        await this.loadMPD();
    }
    async getFirstFregment() {
        const firstFregmentUrl = mpd.getFirstSegmentUrl(this.currentRepresentation);
        const result = await request({ url: firstFregmentUrl, encoding: null });
        return result;
    }
    async getMediaData() {
        const segmentDuration = mpd.getMediaSegmentDuration();
        if (true === this.pooling) {
            await util_1.sleep(segmentDuration * 1000);
        }
        this.pooling = true;
        const result = await this.doGetMediaData();
        return result;
    }
    stop() {
        this.pooling = false;
    }
    async doGetMediaData() {
        const mediaFregmentUrl = mpd.getMediaSegmentUrl(this.currentRepresentation);
        try {
            const result = await request({ url: mediaFregmentUrl, encoding: null });
            return result;
        }
        catch (e) {
            console.error(`trying to get media with error: [${e.message}]`);
        }
    }
    async loadMPD() {
        const mpdUrl = this.options.mpdFile;
        const result = await request(mpdUrl);
        mpd.updateMpd(result);
        this.updateMpd();
        return null;
    }
    checkOptions(options) {
        if (true === _.isEmpty(options.mpdFile)) {
            throw new Error(`[Node Dash Client] mpd file must not be null!`);
        }
    }
    updateMpd() {
        this.currentRepresentation = mpd.getBestRepresentationId();
        this.refreshMinifest();
    }
    refreshMinifest() {
        if (false === _.isEmpty(this.minifestTimer)) {
            clearTimeout(this.minifestTimer);
        }
        const refreshDelay = mpd.getMinimumUpdatePeriod();
        this.minifestTimer = setTimeout(this.loadMPD.bind(this), refreshDelay);
    }
    async refreshTime() {
        const timing = mpd.getUTCSource();
        const result = await request(timing.value);
        this.serverTime = result;
    }
}
exports.NodeDashClient = NodeDashClient;