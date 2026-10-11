import { StatusCodes } from "http-status-codes";
import AppError from "./AppError";

const maxIntegerId = 2147483647;

const parseId = (value: unknown): number => {
    const id = typeof value === "string" ? Number(value) : NaN;

    if (!Number.isInteger(id) || id <= 0 || id > maxIntegerId) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Invalid id", "id must be a positive number");
    }

    return id;
};

export default parseId;
