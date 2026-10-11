import { isNonEmptyString, isOneOf } from "../../utils/validators";
import { userRoles } from "./auth.interface";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateSignup = (body: Record<string, unknown>): string[] => {
    const errors: string[] = [];
    const { name, email, password, role } = body;

    if (!isNonEmptyString(name)) {
        errors.push("name is required");
    } else if (name.trim().length > 100) {
        errors.push("name must not be more than 100 characters");
    }

    if (!isNonEmptyString(email)) {
        errors.push("email is required");
    } else if (!emailPattern.test(email.trim()) || email.trim().length > 150) {
        errors.push("email must be a valid email address");
    }

    if (!isNonEmptyString(password)) {
        errors.push("password is required");
    }

    if (role !== undefined && !isOneOf(role, userRoles)) {
        errors.push("role must be contributor or maintainer");
    }

    return errors;
};

const validateLogin = (body: Record<string, unknown>): string[] => {
    const errors: string[] = [];
    const { email, password } = body;

    if (!isNonEmptyString(email)) {
        errors.push("email is required");
    }

    if (!isNonEmptyString(password)) {
        errors.push("password is required");
    }

    return errors;
};

export const authValidation = {
    validateSignup,
    validateLogin,
};
