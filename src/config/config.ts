import {config as conf} from 'dotenv';

conf();

const _config = {
    port: process.env.PORT,
    MONGO_DB_URI: process.env.MONGO_DB_URI,
    NODE_ENV: process.env.NODE_ENV
}



export const config = Object.freeze(_config);