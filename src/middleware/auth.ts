import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import { ITokenPayload, TUserRole } from "../modules/auth/auth.interface";
import AppError from "../utils/AppError";

declare global {
    namespace Express {
        interface Request {
            user?: ITokenPayload;
        }
    }
}

const verifyToken = (token: string): ITokenPayload => {
    let decoded: string | JwtPayload;

    try {
        decoded = jwt.verify(token, config.jwtSecret);
    } catch (error) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "Unauthorized access", "Token is invalid or expired");
    }

    if (typeof decoded === "string") {
        throw new AppError(StatusCodes.UNAUTHORIZED, "Unauthorized access", "Token is invalid or expired");
    }

    return decoded as ITokenPayload;
};

const auth = (...allowedRoles: TUserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new AppError(StatusCodes.UNAUTHORIZED, "Unauthorized access", "Authorization token is missing");
        }

        // token is sent directly, but a Bearer prefix is also accepted
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
        const user = verifyToken(token);

        if (allowedRoles.length && !allowedRoles.includes(user.role)) {
            throw new AppError(StatusCodes.FORBIDDEN, "Forbidden access", "You do not have permission to perform this action");
        }

        req.user = user;
        next();
    };
};

export default auth;
