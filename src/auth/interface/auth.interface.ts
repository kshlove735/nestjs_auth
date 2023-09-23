import { Request } from "express";

// Google Strategy
type GooleUser = {
    email: string;
    name: string;
    photo: string;
}

// Kakako Strategy
type KakaoUser = {
    email: string;
    nickname: string;
    photo: string;
}

export type GoogleRequest = Request & { user: GooleUser };
export type KakaoRequest = Request & { user: KakaoUser };