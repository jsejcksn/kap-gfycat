/// <reference types="node" />
import * as fs from 'fs';
interface UploadResponseComplete {
    gfyname: string;
    task: 'complete';
}
interface UploadResponseEncoding {
    task: 'encoding';
    time: number;
}
interface UploadResponseError {
    errorMessage: {
        code: string;
        description: string;
    };
    task: 'error';
}
interface UploadResponseNotFound {
    task: 'NotFoundo';
    time: number;
}
declare type UploadResponseUnique = UploadResponseComplete | UploadResponseEncoding | UploadResponseError | UploadResponseNotFound;
declare class GfycatApi {
    accessToken: string;
    clientId: string;
    clientSecret: string;
    gfyname: string;
    constructor(clientId: string, clientSecret: string);
    authenticate(): Promise<string>;
    checkUploadStatus(): Promise<UploadResponseUnique>;
    getUploadId(): Promise<string>;
    uploadFile(filePath: fs.PathLike): Promise<void>;
}
export { GfycatApi, GfycatApi as default };
