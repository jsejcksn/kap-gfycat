/// <reference types="node" />
import * as fs from 'fs';
declare class UploadResponses {
    all: this['complete'] | this['duplicate'] | this['encoding'] | this['error'] | this['notFound'];
    complete: {
        gfyname: string;
        task: 'complete';
    };
    duplicate: {
        avgColor?: any;
        createDate?: any;
        description?: any;
        dislikes?: any;
        extraLemmas?: any;
        frameRate?: any;
        gfyId?: any;
        gfyname?: any;
        gfyName?: any;
        gfyNumber?: any;
        gifSize?: any;
        gifUrl?: any;
        height?: any;
        languageCategories?: any;
        likes?: any;
        max2mbGif?: any;
        max5mbGif?: any;
        md5?: any;
        md5Found: 1;
        mobilePosterUrl?: any;
        mobileUrl?: any;
        mp4Size?: any;
        mp4Url?: any;
        nsfw?: any;
        numFrames?: any;
        posterUrl?: any;
        published?: any;
        source?: any;
        tags?: any;
        task?: any;
        thumb100PosterUrl?: any;
        title?: any;
        userName?: any;
        views?: any;
        webmSize?: any;
        webmUrl?: any;
        width?: any;
    };
    encoding: {
        task: 'encoding';
        time: number;
    };
    error: {
        errorMessage: {
            code: string;
            description: string;
        };
        task: 'error';
    };
    notFound: {
        task: 'NotFoundo';
        time: number;
    };
    unique: this['complete'] | this['encoding'] | this['error'] | this['notFound'];
}
declare class GfycatApi {
    accessToken: string;
    clientId: string;
    clientSecret: string;
    gfyname: string;
    constructor(clientId: string, clientSecret: string);
    authenticate(): Promise<string | never>;
    checkUploadStatus(): Promise<UploadResponses['unique'] | never>;
    getUploadId(): Promise<string | never>;
    uploadFile(filePath: fs.PathLike): Promise<void | never>;
}
export { GfycatApi, GfycatApi as default };
