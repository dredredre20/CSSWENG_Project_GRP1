import { Dropbox } from 'dropbox';
import 'dotenv/config';
import fetch from 'node-fetch';

const dbx = new Dropbox({
  clientId: process.env.DROPBOX_APP_KEY,
  clientSecret: process.env.DROPBOX_APP_SECRET,
  refreshToken: process.env.DROPBOX_REFRESH_TOKEN,
  fetch
});

export { dbx };
