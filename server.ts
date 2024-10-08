import createHttpError from "http-errors";
import app from "./src/app";
import { config } from "./src/config/config";
import connectDB from "./src/config/db";
import globalErrorHandler from "./src/middlewares/globalErrorHandler";


const startServer = () => {

    //connecting database
    connectDB();
    const PORT = config.port || 3000;

    app.get(("/"), (req, res) => {
        const error = createHttpError(400, "Something went wrong!");
        throw error;
        res.send({message: "Server is running!"});
    })

    app.use(globalErrorHandler);

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    })
}

startServer();