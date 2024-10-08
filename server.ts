import app from "./src/app";
import { config } from "./src/config/config";
import connectDB from "./src/config/db";


const startServer = () => {

    //connecting database
    connectDB();
    const PORT = config.port || 3000;



    //server listening
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    })
}

startServer();