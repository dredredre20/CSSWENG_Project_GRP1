import {createClient} from '@supabase/supabase-js';
import dotenv from 'dotenv';
import http from 'http';
import https from 'https';

dotenv.config();

const agent = {
    httpAgent: new http.Agent({keepAlive: false}),
    httpsAgent: new https.Agent({keepAlive: false})
}


export const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY,
    {global: {fetch: (url, options) => fetch(url, {...options, ...agent})}}
);