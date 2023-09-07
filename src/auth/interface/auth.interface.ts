import { Request } from "express";

// Google Strategy
type GooleUser = {
    email: string;
    name: string;
    photo: string;
}

export type GoogleRequest = Request & { user: GooleUser };