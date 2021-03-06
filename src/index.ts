
/*
 * index.ts
 * Author: PerterPon<perterpon@gmail.com>
 * Create: Thu Jul 04 2019 16:31:44 GMT+0800 (CST)
 */

import * as _ from 'lodash';
import * as request from 'request-promise';

import { sleep } from './util';
import * as mpd from './mpd';

export interface TNodeDashClientOptions {
    mpdFile: string;
}

export interface TFirstFregment {
    sampleRate: number;
    codecs: string;
    duration: string;
    timescale: string;
    data: Buffer;
    mimeType: string;
}

export class NodeDashClient {

    private options: TNodeDashClientOptions;
    private minifestTimer: NodeJS.Timeout;
    private serverTime: Date;
    private currentRepresentation: number;
    private pooling: boolean = false;

    constructor(options: TNodeDashClientOptions) {
        this.options = options;
        this.checkOptions(options);
    }

    public async init(): Promise<void> {
        await this.loadMPD();
    }

    public async getFirstFregment(): Promise<TFirstFregment> {
        const firstFregmentUrl: string = mpd.getFirstSegmentUrl(this.currentRepresentation);
        const result: Buffer = await request({url: firstFregmentUrl, encoding: null});
        return {
            sampleRate: this.currentRepresentation,
            codecs: mpd.getCodecs(),
            timescale: mpd.getTimescale(),
            mimeType: mpd.getMimeType(),
            duration: mpd.getDuration(),
            data: result,
        };
    }

    public async getMediaFregment(): Promise<{fregmengId: number, data: Buffer}> {
        const segmentDuration: number = mpd.getMediaSegmentDuration();
        if (true === this.pooling) {
            await sleep(segmentDuration * 1000);
        }
        this.pooling = true;

        const now: number = Date.now() / 1000;
        const segmentNumber: number = Math.floor(now / segmentDuration) + 1;
        return new Promise(async (resolve) => {
            const result: Buffer = await this.doGetMediaData(segmentNumber);
            resolve({
                fregmengId: segmentNumber,
                data: result,
            });
        });
    }

    public stop(): void {
        this.pooling = false;
    }

    private async doGetMediaData(segmentNumber: number): Promise<Buffer> {
        const mediaFregmentUrl: string = mpd.getMediaSegmentUrl(this.currentRepresentation, segmentNumber);
        try {
            const result: Buffer = await request({url: mediaFregmentUrl, encoding: null});
            return result;
        } catch(e) {
            console.error(`trying to get media with error: [${e.message}]`);
        }
    }

    private async loadMPD(): Promise<void> {
        const mpdUrl: string = this.options.mpdFile;
        const result: string = await request(mpdUrl);
        mpd.updateMpd(result);

        this.updateMpd();
        return null;
    }

    private checkOptions(options: TNodeDashClientOptions): void {
        if (true === _.isEmpty(options.mpdFile)) {
            throw new Error(`[Node Dash Client] mpd file must not be null!`);
        }
    }

    private updateMpd(): void {
        this.currentRepresentation = mpd.getBestRepresentationId();

        this.refreshMinifest();
    }

    private refreshMinifest(): void {
        if (false === _.isEmpty(this.minifestTimer)) {
            clearTimeout(this.minifestTimer);
        }

        const refreshDelay: number = mpd.getMinimumUpdatePeriod();
        this.minifestTimer = setTimeout(this.loadMPD.bind(this), refreshDelay);
    }

    private async refreshTime(): Promise<void> {
        const timing = mpd.getUTCSource();
        const result = await request(timing.value);
        this.serverTime = result;
    }

}
