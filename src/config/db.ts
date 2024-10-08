import mongoose from "mongoose";
import { config } from "./config";

const connectDB = async () => {
    try {
        
        // on database connection
        mongoose.connection.on('connected', () => {
            console.log("Database connected!");
        })
        // on connection faild
        mongoose.connection.on('error', (err) => {
            console.log("Error with connecting database! ", err);
        })

        await mongoose.connect(config.MONGO_DB_URI as string);
    } catch (error) {
        console.log('Failed to connect to database: ', error)
        process.exit();
    }
}

export default connectDB;