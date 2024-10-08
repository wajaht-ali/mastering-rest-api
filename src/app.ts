import express from "express";
import globalErrorhandler from './middlewares/globalErrorHandler';
// import createHttpError from "http-errors";
import userRouter from "./users/userRouter";
import cors from 'cors';

const app = express();

// cors 
app.use(cors());

app.get(("/"), (req, res) => {
    // const error = createHttpError(400, "Something went wrong!");
    // throw error;
    res.send({message: "Server is running!"});
})

app.use('/api/v1/users', userRouter);

// global error handler
app.use(globalErrorhandler);

export default app;