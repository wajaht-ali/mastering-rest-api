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
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            const error = createHttpError(400, "All fields are required");
            return next(error);
        }

        // database call
        const user = await UserModel.findOne({ email: email });
        if (user) {
            const error = createHttpError(400, "Email already exists!");
            return next(error);
        }
        // password hashing
        const hashedPassword = await bcrypt.hash(password, 10);

        // process
        const newUser = await UserModel.create({
            name,
            email,
            password: hashedPassword,
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
        });
    }
    } catch (error) {
        next(createHttpError(400, `Error with uploading data ${error}`));
    }
}