import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import UserModel from "../modals/userModal";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import cloudinary from "../config/cloudinary";
import fs from "fs";

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
            const error = createHttpError(400, "All fields are required");
            return next(error);
        }
        // switch(true) {
        //     case !name: 
        //         return next(createHttpError(400, "Name is required!"));
        //         break;
        //     case !email:
        //         return next(createHttpError(400, "Email is required!"));
        //         break;
        //     case !password:
        //         return next(createHttpError(400, "Password is required!"));
        //         break;
        //     case !phone_no:
        //         return next(createHttpError(400, "Phone number is required!"));
        //         break;
        //     case !gender:
        //         return next(createHttpError(400, "Gender is required!"));
        //         break;
        //     case !address:
        //         return next(createHttpError(400, "Address is required!"));
        //         break;
        //     case !photo:
        //         return next(createHttpError(400, "Photo is required!"));
        //         break;
        //     default:
        //         break;
        // }
        const { street, city, state, postalCode, country } = req.body.address;
        if (!street || !city || !state || !postalCode || !country) {
            return next(createHttpError(400, "Complete address details are required!"));
        }

        // database call
        const user = await UserModel.findOne({ email: email });
        if (user) {
            const error = createHttpError(400, "Email already exists!");
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
        }
        fs.unlinkSync(photo.path);
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
    } catch (error) {
        return next(createHttpError(400, `Error with user sign up ${error}`));
    }
};

export const loginUserController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // validation
        const {email, password} = req.body;
        if(!email || !password) {
            return next(createHttpError(400, "All fields are required!"));
        }
        const user = await UserModel.findOne({email});
        if(!user) {
            return next(createHttpError(404, "User Not Found!"));
        }

        // process
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return next(createHttpError(400, "Password is incorrect!"));
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
        return next(createHttpError(400, `Error with user login ${error}`));
    }
}

export const uploadDataController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const file = req.file;
        // Upload the file to cloudinary
        let img;
        if (file && file.path) {
            img = await cloudinary.uploader.upload(file.path, (err) => {
                if (err) {
                    console.log("Error: ", err);
                    return next(createHttpError(400, `Error with uploading data ${err}`));
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
        next(createHttpError(400, `Error with uploading data ${error}`));
    }
}

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
                    console.error("Cloudinary upload error:", err);
                    return next(createHttpError(400, `Error uploading file to Cloudinary: ${err}`));
                }
            }
        }

        res.status(200).send({
            success: true,
            message: "Files uploaded successfully!",
            files: imgUrl
        });
    } catch (error) {
        next(createHttpError(400, `Error handling upload: ${error}`));
    }
};