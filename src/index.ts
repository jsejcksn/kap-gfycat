import * as fs from 'fs';

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
  catch (err) {
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
  catch (err) {
    context.notify('There was a problem communicating with gfycat ☹️');
    context.cancel();
    return;
  }

  context.setProgress('Converting to GIF format…');
  const filePath = await context.filePath();

  context.setProgress('Uploading…');

  try {
    const endpoint = `https://filedrop.gfycat.com/${gfyname}`;
    await context.request(endpoint, {
      body: fs.createReadStream(filePath),
      method: 'put',
    });
  }
  catch (err) {
    context.notify('There was a problem uploading the recording');
    context.cancel();
    return;
  }

  context.setProgress('Processing…');

  try {
    const wait = (ms: number): Promise<undefined> => new Promise(res => setTimeout(res, ms));
    const msPerS = 1000;
    const timeoutSeconds = 30;
    const timeout = Date.now() + (msPerS * timeoutSeconds);
    let task = 'encoding';
    while (task === 'encoding' && Date.now() < timeout) {
      const retrySeconds = 2;
      await wait(msPerS * retrySeconds);
      const endpoint = `https://api.gfycat.com/v1/gfycats/fetch/status/${gfyname}`;
      const response = await context.request(endpoint);
      ({task} = JSON.parse(response.body));
    }
    if (task !== 'complete') {
      if (task === 'encoding') {
        context.copyToClipboard(`https://gfycat.com/${gfyname.toLowerCase()}`);
        context.notify(`Processing hasn't completed yet, but the URL to the GIF has been copied to the clipboard. View the status at https://api.gfycat.com/v1/gfycats/fetch/status/${gfyname}`);
        context.cancel();
        return;
      }
      throw new Error();
    }
  }
  catch (err) {
    context.notify(`There was a problem processing the GIF. You can view the status at https://api.gfycat.com/v1/gfycats/fetch/status/${gfyname}`);
    context.cancel();
    return;
  }

  context.copyToClipboard(`https://gfycat.com/${gfyname.toLowerCase()}`);
  context.notify('URL to the GIF has been copied to the clipboard');
};

const config = {
  clientId: {
    default: '',
    required: true,
    title: 'client_id / API key',
    type: 'string',
  },
  clientSecret: {
    default: '',
    required: true,
    title: 'client_secret',
    type: 'string',
  },
};

const gfycat = {
  action,
  config,
  configDescription: 'You can get the required information for your own account at https://developers.gfycat.com/signup/#/apiform',
  formats: ['gif'],
  title: 'Share to gfycat',
};

export const shareServices = [gfycat];
