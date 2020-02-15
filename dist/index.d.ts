declare enum Formats {
    APNG = "apng",
    GIF = "gif",
    MP4 = "mp4",
    WEBM = "webm"
}
export declare const shareServices: {
    action: (context: any) => Promise<void>;
    config: {
        clientId: {
            default: string;
            description: string;
            required: boolean;
            title: string;
            type: string;
        };
        clientSecret: {
            default: string;
            description: string;
            required: boolean;
            title: string;
            type: string;
        };
    };
    configDescription: string;
    formats: Formats[];
    title: string;
}[];
export {};
