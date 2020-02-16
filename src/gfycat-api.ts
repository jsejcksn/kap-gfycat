// I'm unsure about the quality of this documentation

import * as fs from 'fs';
import got from 'got';

// https://developers.gfycat.com/api/#checking-the-status-of-your-upload
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

interface UploadResponseDuplicate {
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
}

type UploadResponseUnique =
  | UploadResponseComplete
  | UploadResponseEncoding
  | UploadResponseError
  | UploadResponseNotFound;

type UploadResponse = UploadResponseUnique | UploadResponseDuplicate;

class GfycatApi {
  // https://github.com/typescript-eslint/typescript-eslint/issues/977
  /* eslint-disable lines-between-class-members */
  accessToken: string;
  clientId: string;
  clientSecret: string;
  gfyname: string;
  /* eslint-enable lines-between-class-members */

  constructor (clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  async authenticate (): Promise<string> {
    const endpoint = 'https://api.gfycat.com/v1/oauth/token';
    const response = await got(endpoint, {
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'client_credentials',
      }),
      headers: {'Content-Type': 'application/json'},
      method: 'post',
    });

    const responseData: {
      token_type: string;
      scope: string;
      expires_in: number;
      access_token: string;
    } = JSON.parse(response.body);
    this.accessToken = responseData.access_token;
    return this.accessToken;
  }

  async checkUploadStatus (): Promise<UploadResponseUnique> {
    const endpoint = `https://api.gfycat.com/v1/gfycats/fetch/status/${this.gfyname}`;
    const response = await got(endpoint);
    const responseData: UploadResponse = JSON.parse(response.body);
    if (!responseData.task) throw new Error();
    return responseData as UploadResponseUnique;
  }

  async getUploadId (): Promise<string> {
    const endpoint = 'https://api.gfycat.com/v1/gfycats';
    const response = await got(endpoint, {
      headers: {Authorization: `Bearer ${this.accessToken}`},
      method: 'post',
    });

    const responseData: {gfyname: string} = JSON.parse(response.body);
    this.gfyname = responseData.gfyname;
    return this.gfyname;
  }

  async uploadFile (filePath: fs.PathLike): Promise<void> {
    const endpoint = `https://filedrop.gfycat.com/${this.gfyname}`;
    await got(endpoint, {
      body: fs.createReadStream(filePath),
      method: 'put',
    });
  }
}

export {GfycatApi, GfycatApi as default};
