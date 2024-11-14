import {config as conf} from 'dotenv';

conf();

const _config = {
    port: process.env.PORT,
    MONGO_DB_URI: process.env.MONGO_DB_URI,
    NODE_ENV: process.env.NODE_ENV,
    jwtSecret: process.env.JWT_SECRET,
    jwt_password_reset: process.env.JWT_RESET_PASSWORD_SECRET,
    cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
    cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
    My_Email: process.env.MY_EMAIL_ADDRESS,
    EMAIL_HOST: process.env.EMAIL_HOST,
    My_Email_Password: process.env.EMAIIL_PASSWORD,
}



export const config = Object.freeze(_config);