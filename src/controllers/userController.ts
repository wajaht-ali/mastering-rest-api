import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import UserModel from "../modals/userModal";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import cloudinary from "../config/cloudinary";
import fs from "fs";
import crypto from "crypto";
import { sendMail, transporter } from "../services/nodemailer";

// user signup
export const registerUserController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // validation
        const { name, email, password, phone_no, gender, address  } = req.body;
        const photo = req.file;

        // for postman string to object conversion
        if (typeof req.body.address === 'string') {
            req.body.address = JSON.parse(req.body.address);
          }
        if (!name || !email || !password || !phone_no || !gender || !photo || !address) {
            const error = createHttpError(400, "false", "All fields are required");
            return next(error);
        }
        const { street, city, state, postalCode, country } = req.body.address;
        if (!street || !city || !state || !postalCode || !country) {
            return next(createHttpError(400,"false", "Complete address details are required!"));
        }

        // database call
        const user = await UserModel.findOne({ email: email });
        if (user) {
            const error = createHttpError(400,"false", "Email already exists!");
            return next(error);
        }
        // password hashing
        const hashedPassword = await bcrypt.hash(password, 10);

        // upload photo to cloudinary
        let img;
        if(photo && photo.path) {
            img = await cloudinary.uploader.upload(photo.path, {
                folder: "Profile-Images"
            });
            fs.unlink(photo.path, (err) => {
                if(err) {
                    return next(createHttpError(400,"false", `Error with file deletion ${err}`));
                }
            });
        }
        
        // process
        const newUser = await UserModel.create({
            name,
            email,
            password: hashedPassword,
            gender,
            phone_no,
            address: {
                street,
                city,
                state,
                postalCode,
                country,
            },
            photo: img?.secure_url || null,
        });

        // response
        res.status(200).send({
            success: true,
            msg: "Sign up successfully!",
            user: newUser,
        });
        // const html = `
        // <h4>Dear ${newUser.name},</h4> 
        // <br>
        // <p>Welcome to <span style="color: #FF385C;">BookIt</span>, we are glad to have you on board!</p>
        // <p>Thank you for signing up with us. We are excited to have you as a part of our community.</p>
        // <p>Feel free to explore our platform and let us know if you have any questions.</p> 
        // <br>
        // <p>Best wishes</p>
        // <p>Support Team</p>
        // <p style="color: #FF385C; font-weight: bold; font-size: 25px;">BookIt</p>
        // `;

        // await sendMail(newUser.email, "Welcome to the BookIT 🥳", html);
    } catch (error) {
        return next(createHttpError(400,"false", `Error with user sign up ${error}`));
    }
};

//user login
export const loginUserController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // validation
        const {email, password} = req.body;
        if(!email || !password) {
            return next(createHttpError(400,"false", "All fields are required!"));
        }
        const user = await UserModel.findOne({email});
        if(!user) {
            return next(createHttpError(404,"false", "User Not Found!"));
        }

        // process
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return next(createHttpError(400,"false", "Password is incorrect!"));
        }

        // token generation
        const token = jwt.sign({sub: user._id}, config.jwtSecret as string, {
            expiresIn: "7d",
            algorithm: "HS256"
        });

        // response
        res.status(201).send({
            success: true,
            message: "Login successfully",
            accessToken: token
        })
    } catch (error) {
        return next(createHttpError(400, "false", `Error with user login ${error}`));
    }
}

// update user
export const updateUserController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {name, email, password, phone_no, gender, address} = req.body;
        const userId = req.params.id;
        const photo = req.file;

        const existingUser = await UserModel.findById(userId);
        if(!existingUser) {
            return next(createHttpError(404,"false", "User not found!"));
        }

        // for postman string to object conversion
        const parsedAddress = typeof address === 'string' ? JSON.parse(address) : address;

        // Generate salt before hashing
        const hashedPassword = password ? await bcrypt.hash(password, 10) : existingUser.password;
        
        let image;
        if(photo && photo.path) {
            image = await cloudinary.uploader.upload(photo.path, {
                folder: "Profile-Images"
            });
            fs.unlinkSync(photo.path);
        }
        const updatedUser = await UserModel.findByIdAndUpdate(userId, {
            name: name || existingUser.name,
            email: email || existingUser.email,
            password: hashedPassword,
            phone_no: phone_no || existingUser.phone_no,
            gender: gender || existingUser.gender,
            address: {
                street: parsedAddress?.street || existingUser.address.street,
                city: parsedAddress?.city || existingUser.address.city,
                state: parsedAddress?.state || existingUser.address.state,
                postalCode: parsedAddress?.postalCode || existingUser.address.postalCode,
                country: parsedAddress?.country || existingUser.address.country,
            },
            photo: image?.secure_url || existingUser.photo,
         }, {new: true});

        res.status(200).send({
            success: true,
            message: "User updated successfully!",
            user: updatedUser
        });
    } catch (error) {
        return next(createHttpError(400,"false", `Error with updating user ${error}`));
    }
}

// delete user
export const deleteUserController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.id;
        const user = await UserModel.findByIdAndDelete(userId);
        if(!user) {
            return next(createHttpError(404,"false", "User not found!"));
        }
        res.status(200).send({
            success: true,
            message: "User deleted successfully!",
            user
        });
    } catch (error) {
        return next(createHttpError(400, "false", `Error with deleting user ${error}`));
    }
}

// forgot-password
export const forgotPasswordController = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {email} = req.body;
        if(!email) {
            return next(createHttpError(400,"false", "Email is required!"));
        }
        const user = await UserModel.findOne({email});
        if(!user) {
            return next(createHttpError(404,"false", "User not found!"));
        }

        const otp = crypto.randomInt(100000, 999999);
        user.otp = {
            otpNumber: otp,
            expiresIn: Date.now() + 90 * 1000,
        }
        await user.save();
    
    // send mail
    const html = `
        <h4>Dear ${user.name},</h4> <br>
        <p>You have requested to reset your password.</p>
        <p>Please copy and then paste the following OTP pin in forgot password field.</p>
        <div style="width: full; display: flex; justify-items: center; align-items: center;">
        <p style="padding: 8px; background-color: #DFF2EB; color: #3C3D37; text-decoration: none; border-radius: 4px;">${otp}</p>
        </div>
        <br>
        <br>
        <p>Please do not share this OTP with anyone. This OTP will automatically expire in next 90 seconds.</p>
        <a style="color: blue;" href="http://localhost:3000/reset-password/${otp}">http://localhost:3000/reset-password/${otp}</a>`;

    await sendMail(user.email, "Password Reset Request", html);
    res.status(200).send({
        success: true,
        message: 'Password reset link sent to your email!',
    });
    } catch (error) {
        return next(createHttpError(400,"false", `Error with resetting password ${error}`));
    }
}

// resend otp, if expired
export const resendOtpController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;
  
    // Find the user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
        return next(createHttpError(404, "false", "User not found!"));
    };
  
    // Check if the existing OTP is still valid
    if (user.otp.expiresIn && Date.now() < user.otp?.expiresIn) {
      return next(createHttpError(400, "false", 'Your OTP is still valid and has not expired yet.'));
    }
  
    // Generate a new OTP
    const otp = crypto.randomInt(100000, 999999);
        user.otp = {
            otpNumber: otp,
            expiresIn: Date.now() + 90 * 1000,
        }
        await user.save();
  
        // Send reset email
        const mailOptions = {
            from: `${config.My_Email}`,
            to: user.email,
            subject: 'Password Reset Request',
            html: `
            <h4>Dear ${user.name},</h4> <br>
        <p>You have requested to reset your password.</p>
        <p>Please copy and then paste the following OTP pin in forgot password field.</p>
        <div style="width: full; display: flex; justify-items: center; align-items: center;">
            <p style="padding: 8px; background-color: #DFF2EB; color: #3C3D37; text-decoration: none; border-radius: 4px;">${otp}</p>
        </div>
        <br>
        <br>
        <p>Please do not share this OTP with anyone. This OTP will automatically expire in next 90 seconds.</p>
        <a style="color: blue;" href="http://localhost:3000/reset-password/${otp}">http://localhost:3000/reset-password/${otp}</a>
        `,    
    };
    // Send the email
    await transporter.sendMail(mailOptions);
    res.status(200).send({
        success: true,
        message: 'Password reset link sent to your email!',
    });
    } catch (error) {
        return next(createHttpError(400,"false", `Error with resending OTP ${error}`));
    }
}

// Verify OTP and generate temporary token for password reset
export const verifyOtpController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp } = req.body;
  
    const user = await UserModel.findOne({ email });
    if (!user) {
        return next(createHttpError(404, "false", 'User not found'));
    }
  
    if (user.otp.otpNumber !== parseInt(otp)) {
        return next(createHttpError(400, "false", 'Invalid OTP'));
    }
    if (user.otp.expiresIn && Date.now() > user.otp.expiresIn) {
        return next(createHttpError(400, "false", 'OTP has expired'));
    }
  
    const resetToken = jwt.sign({ email: user.email }, config.jwt_password_reset as string, { expiresIn: '15m' });
  
    user.otp.otpNumber = undefined;
    user.otp.expiresIn = undefined;
    await user.save();
  
    res.status(200).json({ message: 'OTP verified', token: resetToken });
    } catch (error) {
        return next(createHttpError(400, "false", `Error with verifying OTP ${error}`));
    }
};

// Reset password
export const resetPasswordController = async (req: Request, res: Response, next: NextFunction) => {
    try {
    const { token, password, cpassword } = req.body;
    
    if (password !== cpassword) {
        return next(createHttpError(400, "false", 'Passwords do not match'));
    }
    const resetToken = jwt.verify(token, config.jwt_password_reset as string) as { email: string };
    if (!resetToken) {
        return next(createHttpError(400, "false", 'Invalid or expired token'));
    }

    const user = await UserModel.findOne({ email: resetToken.email });
    if (!user) {
        return next(createHttpError(404, "false", 'User not found'));
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword; 
    await user.save();
    res.status(200).send({success: true, message: 'Password reset successful' });

    } catch (error) {
        console.error('JWT Error:', error);
        return next(createHttpError(400, "false", `Error with resetting password ${error}`));
    }
  };

// upload media
export const uploadDataController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const file = req.file;
        // Upload the file to cloudinary
        let img;
        if (file && file.path) {
            img = await cloudinary.uploader.upload(file.path, (err) => {
                if (err) {
                    return next(createHttpError(400,"false", `Error with uploading data ${err}`));
                }
            });
            // Delete the file from the server
        fs.unlinkSync(file.path);
        
        res.status(200).send({
            success: true,
            message: "File uploaded successfully!",
            file: img
        })
    }
    } catch (error) {
        next(createHttpError(400,"false", `Error with uploading data ${error}`));
    }
}
// upload multiple media
export const uploadMultipleDataController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const files = req.files as Express.Multer.File[];
        const imgUrl: string[] = [];

        if (files && files.length > 0) {
            for (const file of files) {
                try {
                    // Upload the file to Cloudinary
                    const result = await cloudinary.uploader.upload(file.path, {
                        folder: "Cover-Images",
                    });
                    imgUrl.push(result.secure_url);
                    
                    // Delete the file from the server
                    fs.unlinkSync(file.path);
                } catch (err) {
                    return next(createHttpError(400, "false", `Error uploading file to Cloudinary: ${err}`));
                }
            }
        }

        res.status(200).send({
            success: true,
            message: "Files uploaded successfully!",
            files: imgUrl
        });
    } catch (error) {
        next(createHttpError(400,"false", `Error handling upload: ${error}`));
    }
};