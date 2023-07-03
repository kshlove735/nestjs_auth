export interface AccessTokenWithOption {
    accessToken: string,
    domain: string,
    path: string,
    httpOnly: boolean,
    maxAge: number
}