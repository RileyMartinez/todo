import { config } from 'dotenv';
import { CookieOptions } from 'express';

config();

if (!process.env.JWT_REFRESH_EXPIRATION) {
    throw new Error('JWT_REFRESH_EXPIRATION is not defined');
}

// parse whether the value is days, hours, minutes, or seconds
const jwtRefreshExpiration = process.env.JWT_REFRESH_EXPIRATION;
const jwtRefreshExpirationValue = parseInt(jwtRefreshExpiration);

if (isNaN(jwtRefreshExpirationValue)) {
    throw new Error('JWT_REFRESH_EXPIRATION value is not a number');
}

const jwtRefreshExpirationUnit = jwtRefreshExpiration.replace(jwtRefreshExpirationValue.toString(), '').trim();

if (!['d', 'h', 'm', 's'].includes(jwtRefreshExpirationUnit)) {
    throw new Error('JWT_REFRESH_EXPIRATION unit is not valid');
}

const maxAge =
    jwtRefreshExpirationValue *
    (jwtRefreshExpirationUnit === 'd'
        ? 24 * 60 * 60
        : jwtRefreshExpirationUnit === 'h'
          ? 60 * 60
          : jwtRefreshExpirationUnit === 'm'
            ? 60
            : 1) *
    1000;

export const refreshTokenCookieConfig: CookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: maxAge,
};
