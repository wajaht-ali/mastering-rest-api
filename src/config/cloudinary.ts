import { v2 as cloudinary } from "cloudinary";
import { config } from "./config";

    // Configuration
    cloudinary.config({ 
        cloud_name: config.cloudinary_cloud_name, 
        api_key: config.cloudinary_api_key, 
        api_secret: config.cloudinary_api_secret,
        api_environment_variable: 'CLOUDINARY_URL=cloudinary://521682549576967:HS-Kb67QOD9n9LfTnMq9WVdsX0I@dgb402jc7'
    });

export default cloudinary;