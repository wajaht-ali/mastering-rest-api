import { NextFunction, Request, Response } from "express";

export const registerUserController = async (req: Request, res: Response, next: NextFunction) => {
    res.json({msg: "This is register controller!"});   
}