"use strict";
/*
 * mpd.ts
 * Author: 王 羽涵<perterpon.wang@bytedance.com>
 * Create: Thu Jul 04 2019 21:17:52 GMT+0800 (CST)
 */
Object.defineProperty(exports, "__esModule", { value: true });
const xmlParser = require("fast-xml-parser");
const pxd = require('parse-xsd-duration').default;
let mpd = null;
function updateMpd(mpdFile) {
    const mpdObj = xmlParser.parse(mpdFile, {
        ignoreAttributes: false,
    });
    mpd = mpdObj;
}
exports.updateMpd = updateMpd;
function getUTCSource() {
    const timing = mpd.MPD.UTCTiming;
    return {
        schemaIdUri: timing["@_schemaIdUri"],
        value: timing["@_value"],
    };
}
exports.getUTCSource = getUTCSource;
function getMinimumUpdatePeriod() {
    const refreshDelay = mpd.MPD["@_minimumUpdatePeriod"];
    let refreshDelayNum = pxd(refreshDelay);
    if (refreshDelayNum * 1000 > 0x7FFFFFFF) {
        refreshDelayNum = 0x7FFFFFFF / 1000;
    }
    return refreshDelayNum;
}
exports.getMinimumUpdatePeriod = getMinimumUpdatePeriod;
function getFirstSegmentUrl(representationId) {
    const template = mpd.MPD.Period.AdaptationSet.SegmentTemplate;
    const dashTemplate = template["@_initialization"];
    const representation = getRepresentation(representationId);
    const dashFileName = dashTemplate.replace('$RepresentationID$', representation);
    const baseURL = mpd.MPD.BaseURL["#text"];
    return `${baseURL}${dashFileName}`;
}
exports.getFirstSegmentUrl = getFirstSegmentUrl;
function getMediaSegmentUrl(representationId) {
    const template = mpd.MPD.Period.AdaptationSet.SegmentTemplate;
    const baseURL = mpd.MPD.BaseURL["#text"];
    const segmentDutation = getMediaSegmentDuration();
    const now = Date.now() / 1000;
    const segmentNumber = Math.floor(now / segmentDutation);
    const mediaFileTemp = template["@_media"];
    const representation = getRepresentation(representationId);
    let mediaFileName = mediaFileTemp.replace('$RepresentationID$', representation);
    mediaFileName = mediaFileName.replace('$Number$', segmentNumber.toString());
    return `${baseURL}${mediaFileName}`;
}
exports.getMediaSegmentUrl = getMediaSegmentUrl;
function getBestRepresentationId() {
    const representations = mpd.MPD.Period.AdaptationSet.Representation;
    let bestRepresentation = Number.MIN_VALUE;
    for (let i = 0; i < representations.length; i++) {
        const representation = representations[i];
        bestRepresentation = Math.max(bestRepresentation, Number(representation["@_bandwidth"]));
    }
    return bestRepresentation;
}
exports.getBestRepresentationId = getBestRepresentationId;
function getRepresentation(representationId) {
    const contentType = mpd.MPD.Period.AdaptationSet["@_contentType"];
    return `${contentType}=${representationId}`;
}
exports.getRepresentation = getRepresentation;
function getMediaSegmentDuration() {
    const template = mpd.MPD.Period.AdaptationSet.SegmentTemplate;
    return Number(template["@_duration"]) / Number(template["@_timescale"]);
}
exports.getMediaSegmentDuration = getMediaSegmentDuration;
function getCodecs() {
    return mpd.MPD.Period.AdaptationSet["@_codecs"];
}
exports.getCodecs = getCodecs;
function getMimeType() {
    return mpd.MPD.Period.AdaptationSet["@_mimeType"];
}
exports.getMimeType = getMimeType;
function getDuration() {
    return mpd.MPD.Period.AdaptationSet.SegmentTemplate["@_duration"];
}
exports.getDuration = getDuration;
function getTimescale() {
    return mpd.MPD.Period.AdaptationSet.SegmentTemplate["@_timescale"];
}
exports.getTimescale = getTimescale;
