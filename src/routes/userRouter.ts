import express from 'express';
import { deleteUserController, loginUserController, registerUserController, updateUserController, uploadDataController, uploadMultipleDataController } from '../controllers/userController';
import { isLoggedIn } from '../middlewares/userMiddlewares';

const userRouter = express.Router();

userRouter.post('/register', registerUserController);
userRouter.post('/login', loginUserController);
userRouter.put('/update-user/:id', isLoggedIn, updateUserController);
userRouter.delete('/delete-user/:id', isLoggedIn, deleteUserController);
userRouter.post('/sendData', isLoggedIn, uploadDataController);
userRouter.post('/sendMultipleData', uploadMultipleDataController);

export default userRouter;