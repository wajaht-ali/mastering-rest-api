import express from 'express';
import { registerUserController } from '../controllers/userController';

const userRouter = express.Router();

userRouter.post('/register', registerUserController);

export default userRouter;