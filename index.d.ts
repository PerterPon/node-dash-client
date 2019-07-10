
declare module "node-dash-client" {

    export interface TFirstFregment {
        sampleRate: number;
        codecs: string;
        duration: string;
        timescale: string;
        data: Buffer;
        mimeType: string;
    }

    export class NodeDashClient {
        constructor(options: TNodeDashClientOptions);
        init(): Promise<void>;
        getFirstFregment(): Promise<TFirstFregment>;
        getMediaFregment(): Promise<Buffer>;
        stop(): void;
    }

    export interface TNodeDashClientOptions {
        mpdFile: string;
    }

}
