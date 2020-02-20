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
  avgColor?: string;
  createDate?: number;
  description?: string;
  dislikes?: string;
  domainWhitelist?: unknown[];
  extraLemmas?: string;
  frameRate?: number;
  gatekeeper?: number;
  geoWhitelist?: unknown[];
  gfyId?: string;
  gfyname?: string;
  gfyName?: string;
  gfyNumber?: string;
  gifSize?: unknown;
  gifUrl?: string;
  hasAudio?: boolean;
  hasTransparency?: boolean;
  height?: number;
  languageCategories?: unknown[];
  languageText?: string;
  likes?: string;
  max1mbGif?: string;
  max2mbGif?: string;
  max5mbGif?: string;
  md5?: string;
  md5Found: 1;
  miniPosterUrl?: string;
  miniUrl?: string;
  mobilePosterUrl?: string;
  mobileUrl?: string;
  mp4Size?: number;
  mp4Url?: string;
  nsfw?: string;
  numFrames?: number;
  posterUrl?: string;
  published?: number;
  source?: number;
  tags?: unknown[];
  task?: string;
  thumb100PosterUrl?: string;
  title?: string;
  userName?: string;
  views?: number;
  webmSize?: number;
  webmUrl?: string;
  webpUrl?: string;
  width?: number;
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
