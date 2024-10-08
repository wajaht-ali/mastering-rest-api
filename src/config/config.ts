import {config as conf} from 'dotenv';

conf();

const _config = {
    port: process.env.PORT,
    MONGO_DB_URI: process.env.MONGO_DB_URI
}



export const config = Object.freeze(_config);