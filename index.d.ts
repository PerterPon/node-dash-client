
declare module "node-dash-client" {

    export class NodeDashClient {
        new(options: TNodeDashClientOptions):void;
        init(): Promise<void>;
        getFirstFregment(): Promise<Buffer>;
        getMediaFregment(): Promise<Buffer>;
        stop(): void;
    }

    export interface TNodeDashClientOptions {
        mpdFile: string;
    }

}
