import { Request } from "express";

// Google Strategy
type GooleUser = {
    email: string;
    firstName: string;
    lastName: string;
    photo: string;
}

export type GoogleRequest = Request & { user: GooleUser };