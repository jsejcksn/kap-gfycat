import {GfycatApi} from './gfycat-api.js';

enum Formats {
  APNG = 'apng',
  GIF = 'gif',
  MP4 = 'mp4',
  WEBM = 'webm',
}

const action = async (context: any): Promise<void> => {
  const notifyAndCancel = (notificationMessage: string): void => {
    context.notify(notificationMessage);
    context.cancel();
  };

  const gfycatApi = new GfycatApi(
    context.config.get('clientId'),
    context.config.get('clientSecret'),
  );

  context.setProgress('Authenticating…');

  try {
    await gfycatApi.authenticate();
  }
  catch {
    notifyAndCancel('There was a problem authenticating your account. Is your API info up to date?');
    return;
  }

  context.setProgress('Finding a place to upload…');
  let gfyname: string;

  try {
    gfyname = await gfycatApi.getUploadId();
  }
  catch {
    notifyAndCancel('There was a problem communicating with gfycat ☹️');
    return;
  }

  const filePath = await context.filePath();
  context.setProgress('Uploading…');

  try {
    await gfycatApi.uploadFile(filePath);
    context.copyToClipboard(`https://gfycat.com/${gfyname.toLowerCase()}`);
    context.notify('The URL to the upload has been copied to the clipboard');
    context.notify('But gfycat is still processing the upload… ⏱');
  }
  catch {
    notifyAndCancel('There was a problem uploading the recording');
    return;
  }

  context.setProgress('Processing on gfycat…');

  try {
    const wait = (ms: number): Promise<undefined> => new Promise(res => setTimeout(res, ms));
    const msPerS = 1000;
    const timeoutSeconds = 120;
    const unixTimeout = Date.now() + (msPerS * timeoutSeconds);
    let task = 'encoding';
    while (task === 'encoding' && Date.now() < unixTimeout) {
      const retrySeconds = 4;
      await wait(msPerS * retrySeconds);
      const status = await gfycatApi.checkUploadStatus();
      ({task} = status);
    }
    switch (task) {
      case 'complete': {
        context.notify('gfycat has finished processing the upload');
        break;
      }
      case 'encoding': {
        context.notify(`gfycat has taken longer than ${timeoutSeconds} seconds to process the upload`);
        context.notify(`See the status at https://api.gfycat.com/v1/gfycats/fetch/status/${gfyname}`);
        return;
      }
      default: throw new Error();
    }
  }
  catch {
    context.copyToClipboard(`https://api.gfycat.com/v1/gfycats/fetch/status/${gfyname}`);
    notifyAndCancel(`There was a problem processing the uploaded file. See the status at https://api.gfycat.com/v1/gfycats/fetch/status/${gfyname}`);
  }
};

const config = {
  clientId: {
    default: '',
    description: 'This is your `client_id`.',
    required: true,
    title: 'API Key',
    type: 'string',
  },
  clientSecret: {
    default: '',
    description: 'This is your `client_secret`.',
    required: true,
    title: 'API Secret',
    type: 'string',
  },
};

export const shareServices = [
  {
    action,
    config,
    configDescription: 'You can sign up for an API key at https://developers.gfycat.com/signup/#/apiform and find more info about the API at https://developers.gfycat.com/api/.',
    formats: [Formats.GIF, Formats.MP4],
    title: 'Share to gfycat',
  },
];
