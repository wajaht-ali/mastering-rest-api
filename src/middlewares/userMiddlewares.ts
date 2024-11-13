import createHttpError from "http-errors";
import { config } from "../config/config";
import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

interface DecodedUser {
    _id: string,
    role: string,
    email: string
}

interface MyRequest extends Request {
    user: DecodedUser; // Add the 'user' property with the type of your decoded user
  }

export const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
    try {
        const header = req.headers.authorization;
    if(!header || !header.startsWith("Bearer ")) {
        return next(createHttpError(401, "false", "Authorization token required!"));
    }
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, config.jwtSecret as string) as DecodedUser;
    (req as MyRequest).user = decoded;
    next();
    } catch (err) {
        return next(createHttpError(401, "false", `Invalid token ${err}`));
    }

}