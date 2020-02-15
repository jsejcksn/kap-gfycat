"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const got_1 = require("got");
class UploadResponses {
}
class GfycatApi {
    constructor(clientId, clientSecret) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }
    async authenticate() {
        const endpoint = 'https://api.gfycat.com/v1/oauth/token';
        const response = await got_1.default(endpoint, {
            body: JSON.stringify({
                client_id: this.clientId,
                client_secret: this.clientSecret,
                grant_type: 'client_credentials',
            }),
            headers: { 'Content-Type': 'application/json' },
            method: 'post',
        });
        const responseData = JSON.parse(response.body);
        this.accessToken = responseData.access_token;
        return this.accessToken;
    }
    async checkUploadStatus() {
        const endpoint = `https://api.gfycat.com/v1/gfycats/fetch/status/${this.gfyname}`;
        const response = await got_1.default(endpoint);
        const responseData = JSON.parse(response.body);
        if (!responseData.task)
            throw new Error();
        return responseData;
    }
    async getUploadId() {
        const endpoint = 'https://api.gfycat.com/v1/gfycats';
        const response = await got_1.default(endpoint, {
            headers: { Authorization: `Bearer ${this.accessToken}` },
            method: 'post',
        });
        const responseData = JSON.parse(response.body);
        this.gfyname = responseData.gfyname;
        return this.gfyname;
    }
    async uploadFile(filePath) {
        const endpoint = `https://filedrop.gfycat.com/${this.gfyname}`;
        await got_1.default(endpoint, {
            body: fs.createReadStream(filePath),
            method: 'put',
        });
    }
}
exports.GfycatApi = GfycatApi;
exports.default = GfycatApi;
