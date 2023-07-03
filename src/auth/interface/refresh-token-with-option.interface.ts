export interface RefreshTokenWithOption {
    refreshToken: string,
    domain: string,
    path: string,
    httpOnly: boolean,
    maxAge: number
}