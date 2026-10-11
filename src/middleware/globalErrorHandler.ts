import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import AppError from "../utils/AppError";

const globalErrorHandler = (error: unknown, req: Request, res: Response, next: NextFunction) => {
    let statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR;
    let message = "Something went wrong";
    let errors: string | string[] = "Internal server error";

    if (error instanceof AppError) {
        statusCode = error.statusCode;
        message = error.message;
        errors = error.errors;
    } else if (error instanceof SyntaxError && "status" in error && error.status === StatusCodes.BAD_REQUEST) {
        statusCode = StatusCodes.BAD_REQUEST;
        message = "Invalid request body";
        errors = "Request body must be valid JSON";
    } else if (error instanceof Error) {
        console.error(error);
        errors = error.message;
    }

    res.status(statusCode).json({
        success: false,
        message,
        errors,
    });
};

export default globalErrorHandler;
