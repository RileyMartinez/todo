import { CookieOptions } from 'express';

export const invalidTokenCookieConfig: CookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 0,
};
