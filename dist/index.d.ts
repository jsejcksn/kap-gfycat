export declare const shareServices: {
    action: (context: any) => Promise<void>;
    config: {
        clientId: {
            default: string;
            required: boolean;
            title: string;
            type: string;
        };
        clientSecret: {
            default: string;
            required: boolean;
            title: string;
            type: string;
        };
    };
    configDescription: string;
    formats: string[];
    title: string;
}[];
