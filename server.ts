import app from "./src/app";
import { config } from "./src/config/config";
import connectDB from "./src/config/db";


const startServer = () => {

    //connecting database
    connectDB();
    const PORT = config.port || 3000;

    app.get(("/"), (req, res) => {
        res.send({message: "Server is running!"});
    })
    app.listen(PORT, () => {
        console.log(`Server is running on ${PORT}`);
    })
}

startServer();