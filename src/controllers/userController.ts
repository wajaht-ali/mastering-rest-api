import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import UserModel from "../modals/userModal";
import bcrypt from "bcrypt";

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
