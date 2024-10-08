import app from "./src/app";
import { config } from "./src/config/config";


const startServer = () => {
    const PORT = config.port || 3000;

    app.get(("/"), (req, res) => {
        res.send({message: "Server is running!"});
    })
    app.listen(PORT, () => {
        console.log(`Server is running ${PORT}`);
    })
}

startServer();