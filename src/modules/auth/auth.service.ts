import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import config from "../../config";
import { pool } from "../../config/db";
import AppError from "../../utils/AppError";
import { ISignupPayload, TSafeUser } from "./auth.interface";

const signup = async (payload: ISignupPayload): Promise<TSafeUser> => {
    const email = payload.email.trim().toLowerCase();

    const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);

    if (existingUser.rows.length) {
        throw new AppError(StatusCodes.BAD_REQUEST, "User already exists", "This email is already registered");
    }

    const hashedPassword = await bcrypt.hash(payload.password, config.saltRounds);

    const result = await pool.query<TSafeUser>(
        `INSERT INTO users(name, email, password, role)
        VALUES($1, $2, $3, $4)
        RETURNING id, name, email, role, created_at, updated_at`,
        [payload.name.trim(), email, hashedPassword, payload.role || "contributor"]
    );

    const user = result.rows[0];

    if (!user) {
        throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, "Registration failed", "User could not be created");
    }

    return user;
};

export const authService = {
    signup,
};
