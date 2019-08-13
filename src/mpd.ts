
/*
 * mpd.ts
 * Author: 王 羽涵<perterpon.wang@bytedance.com>
 * Create: Thu Jul 04 2019 21:17:52 GMT+0800 (CST)
 */

import * as xmlParser from 'fast-xml-parser';
const pxd = require('parse-xsd-duration').default;

export interface TMPD {
    MPD: {
        "@_availabilityStartTime": string;
        "@_maxSegmentDuration": string;
        "@_minBufferTime": string;
        "@_minimumUpdatePeriod": string;
        "@_profiles": string;
        "@_publishTime": string;
        "@_timeShiftBufferDepth": string;
        "@_type": string;
        "@_xmlns": string;
        "@_xmlns:dvb": string;
        "@_xmlns:xsi": string;
        "@_xsi:schemaLocation": string;
        BaseURL: {
            "#text": string;
        }
        Period: {
            AdaptationSet: {
                "@_audioSamplingRate": string;
                "@_codecs": string;
                "@_contentType": string;
                "@_group": string;
                "@_lang": string;
                "@_maxBandwidth": string;
                "@_mimeType": string;
                "@_minBandwidth": string;
                "@_segmentAlignment": string;
                "@_startWithSAP": string;
                Representation: {
                    "@_id": string;
                    "@_bandwidth": string;
                }[]
                Role: {
                    "@_schemaIdUri": string;
                    "@_value": string;
                }
                SegmentTemplate: {
                    "@_duration": string;
                    "@_initialization": string;
                    "@_media": string;
                    "@_startNumber": string;
                    "@_timescale": string;
                }
            }
        }
        UTCTiming: {
            "@_schemaIdUri": string;
            "@_value": string;
        }
    }
}

let mpd: TMPD = null;

export function updateMpd(mpdFile: string): void {
    const mpdObj: TMPD = xmlParser.parse(mpdFile, {
        ignoreAttributes: false,
    });
    mpd = mpdObj;
}

export function getUTCSource(): {schemaIdUri: string, value: string} {
    const timing = mpd.MPD.UTCTiming;
    return {
        schemaIdUri: timing["@_schemaIdUri"],
        value: timing["@_value"],
    }
}

export function getMinimumUpdatePeriod(): number {
    const refreshDelay: string = mpd.MPD["@_minimumUpdatePeriod"];
    let refreshDelayNum: number = pxd(refreshDelay);
    if (refreshDelayNum * 1000 > 0x7FFFFFFF) {
        refreshDelayNum = 0x7FFFFFFF / 1000;
    }
    return refreshDelayNum;
}

export function getFirstSegmentUrl(representationId: number): string {
    const template = mpd.MPD.Period.AdaptationSet.SegmentTemplate;
    const dashTemplate: string = template["@_initialization"];
    const representation: string = getRepresentation(representationId);
    const dashFileName: string = dashTemplate.replace('$RepresentationID$', representation);
    const baseURL: string = mpd.MPD.BaseURL["#text"];
    return `${baseURL}${dashFileName}`;
}

export function getMediaSegmentUrl(representationId: number, segmentNumber: number): string {
    const template = mpd.MPD.Period.AdaptationSet.SegmentTemplate;
    const baseURL: string = mpd.MPD.BaseURL["#text"];
    const mediaFileTemp: string = template["@_media"];
    const representation: string = getRepresentation(representationId);
    let mediaFileName: string = mediaFileTemp.replace('$RepresentationID$', representation);
    mediaFileName = mediaFileName.replace('$Number$', segmentNumber.toString());
    return `${baseURL}${mediaFileName}`;
}

export function getBestRepresentationId(): number {
    const representations = mpd.MPD.Period.AdaptationSet.Representation;
    let bestRepresentation = Number.MIN_VALUE;
    for (let i = 0; i < representations.length; i++) {
        const representation = representations[i];
        bestRepresentation = Math.max(bestRepresentation, Number(representation["@_bandwidth"]));
    }
    return bestRepresentation;
}

export function getRepresentation(representationId: number): string {
    const contentType: string = mpd.MPD.Period.AdaptationSet["@_contentType"];
    return `${contentType}=${representationId}`;
}

export function getMediaSegmentDuration(): number {
    const template = mpd.MPD.Period.AdaptationSet.SegmentTemplate;
    return Number(template["@_duration"]) / Number(template["@_timescale"]);
}

export function getCodecs(): string {
    return mpd.MPD.Period.AdaptationSet["@_codecs"];
}

export function getMimeType(): string {
    return mpd.MPD.Period.AdaptationSet["@_mimeType"];
}

export function getDuration(): string {
    return mpd.MPD.Period.AdaptationSet.SegmentTemplate["@_duration"];
}

export function getTimescale(): string {
    return mpd.MPD.Period.AdaptationSet.SegmentTemplate["@_timescale"];
}
