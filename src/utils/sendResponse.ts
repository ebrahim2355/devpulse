import { Response } from "express";

interface IResponsePayload<T> {
    statusCode: number;
    message: string;
    data?: T;
}

const sendResponse = <T>(res: Response, payload: IResponsePayload<T>) => {
    res.status(payload.statusCode).json({
        success: true,
        message: payload.message,
        data: payload.data,
    });
};

export default sendResponse;
