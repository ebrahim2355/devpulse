export const userRoles = ["contributor", "maintainer"] as const;

export type TUserRole = (typeof userRoles)[number];

export interface IUser {
    id: number;
    name: string;
    email: string;
    password: string;
    role: TUserRole;
    created_at: Date;
    updated_at: Date;
}

export type TSafeUser = Omit<IUser, "password">;

export interface ISignupPayload {
    name: string;
    email: string;
    password: string;
    role?: TUserRole;
}
