import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import AppError from "../utils/AppError";
import { isRecord } from "../utils/validators";

type TValidator = (data: Record<string, unknown>) => string[];
type TRequestSource = "body" | "query";

const validateRequest = (validator: TValidator, source: TRequestSource = "body") => {
    return (req: Request, res: Response, next: NextFunction) => {
        const data: unknown = req[source];
        const errors = validator(isRecord(data) ? data : {});

        if (errors.length) {
            throw new AppError(StatusCodes.BAD_REQUEST, "Validation failed", errors);
        }

        next();
    };
};

export default validateRequest;
