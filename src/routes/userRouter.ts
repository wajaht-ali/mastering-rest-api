import express from 'express';
import { loginUserController, registerUserController, uploadDataController } from '../controllers/userController';

const userRouter = express.Router();

userRouter.post('/register', registerUserController);
userRouter.post('/login', loginUserController);
userRouter.post('/sendData', uploadDataController);

export default userRouter;