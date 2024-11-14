import express from 'express';
import { deleteUserController, forgotPasswordController, loginUserController, registerUserController, resendOtpController, resetPasswordController, updateUserController, uploadDataController, uploadMultipleDataController, verifyOtpController } from '../controllers/userController';
import { isLoggedIn } from '../middlewares/userMiddlewares';

const userRouter = express.Router();

userRouter.post('/register', registerUserController);
userRouter.post('/login', loginUserController);
userRouter.put('/update-user/:id', isLoggedIn, updateUserController);
userRouter.delete('/delete-user/:id', isLoggedIn, deleteUserController);
userRouter.post('/forgot-password', forgotPasswordController);
userRouter.post('/verify-otp', verifyOtpController);
userRouter.post('/resend-otp', resendOtpController);
userRouter.post('/reset-password', resetPasswordController);
userRouter.post('/sendData', isLoggedIn, uploadDataController);
userRouter.post('/sendMultipleData', uploadMultipleDataController);

export default userRouter;