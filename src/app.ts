import express from "express";
import globalErrorhandler from './middlewares/globalErrorHandler';
// import createHttpError from "http-errors";
import userRouter from "./routes/userRouter";
import cors from 'cors';

const app = express();

// cors 
app.use(cors({
    origin: "*",
    methods: ["GET, POST, DELETE, PUT"],
    credentials: true
}));

// json data configuration
app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).send({message: "Server is running!"});
})

app.use('/api/v1/users', userRouter);

// global error handler
app.use(globalErrorhandler);

export default app;