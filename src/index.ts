import * as fs from 'fs';

enum Formats {
  APNG = 'apng',
  GIF = 'gif',
  MP4 = 'mp4',
  WEBM = 'webm',
}

const action = async (context: any): Promise<void> => {
  context.setProgress('Authenticating…');
  let access_token: string;

  try {
    const endpoint = 'https://api.gfycat.com/v1/oauth/token';
    const response = await context.request(endpoint, {
      body: JSON.stringify({
        client_id: context.config.get('clientId'),
        client_secret: context.config.get('clientSecret'),
        grant_type: 'client_credentials',
      }),
      headers: {'Content-Type': 'application/json'},
      method: 'post',
    });

    ({access_token} = JSON.parse(response.body));
  }
  catch {
    context.notify('There was a problem authenticating your account. Is your API info up to date?');
    context.cancel();
    return;
  }

  context.setProgress('Finding a place to upload…');
  let gfyname: string;

  try {
    const endpoint = 'https://api.gfycat.com/v1/gfycats';
    const response = await context.request(endpoint, {
      headers: {Authorization: `Bearer ${access_token}`},
      method: 'post',
    });

    ({gfyname} = JSON.parse(response.body));
  }
  catch {
    context.notify('There was a problem communicating with gfycat ☹️');
    context.cancel();
    return;
  }

  const filePath = await context.filePath();
  context.setProgress('Uploading…');

  try {
    const endpoint = `https://filedrop.gfycat.com/${gfyname}`;
    await context.request(endpoint, {
      body: fs.createReadStream(filePath),
      method: 'put',
    });
    context.notify('Upload complete. Waiting for gfycat to process the recording… ⏱');
  }
  catch {
    context.notify('There was a problem uploading the recording');
    context.cancel();
    return;
  }

  context.setProgress('Processing on gfycat…');

  try {
    const wait = (ms: number): Promise<undefined> => new Promise(res => setTimeout(res, ms));
    const msPerS = 1000;
    const timeoutSeconds = 60;
    const timeout = Date.now() + (msPerS * timeoutSeconds);
    let task = 'encoding';
    while (task === 'encoding' && Date.now() < timeout) {
      const retrySeconds = 4;
      await wait(msPerS * retrySeconds);
      const endpoint = `https://api.gfycat.com/v1/gfycats/fetch/status/${gfyname}`;
      const response = await context.request(endpoint);
      ({task} = JSON.parse(response.body));
    }
    switch (task) {
      case 'complete': {
        context.copyToClipboard(`https://gfycat.com/${gfyname.toLowerCase()}`);
        context.notify('The URL to the upload has been copied to the clipboard');
        break;
      }
      case 'encoding': {
        context.copyToClipboard(`https://gfycat.com/${gfyname.toLowerCase()}`);
        context.notify('gfycat is still processing the upload, but its URL has been copied to the clipboard anyway');
        return;
      }
      default: throw new Error();
    }
  }
  catch {
    context.copyToClipboard(`https://api.gfycat.com/v1/gfycats/fetch/status/${gfyname}`);
    context.notify(`There was a problem processing the uploaded file. See the status at https://api.gfycat.com/v1/gfycats/fetch/status/${gfyname}`);
    context.cancel();
  }
};

const config = {
  clientId: {
    default: '',
    required: true,
    title: 'API Key',
    description: 'This is your `client_id`.',
    type: 'string',
  },
  clientSecret: {
    default: '',
    required: true,
    title: 'API Secret',
    description: 'This is your `client_secret`.',
    type: 'string',
  },
};

const gfycat = {
  action,
  config,
  configDescription: 'You can sign up for an API key at https://developers.gfycat.com/signup/#/apiform and find more info about the API at https://developers.gfycat.com/api/#authentication.',
  formats: [Formats.GIF, Formats.MP4],
  title: 'Share to gfycat',
};

export const shareServices = [gfycat];
