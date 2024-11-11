import express from 'express';
import { loginUserController, registerUserController, uploadDataController, uploadMultipleDataController } from '../controllers/userController';

const userRouter = express.Router();

userRouter.post('/register', registerUserController);
userRouter.post('/login', loginUserController);
userRouter.post('/sendData', uploadDataController);
userRouter.post('/sendMultipleData', uploadMultipleDataController);

export default userRouter;