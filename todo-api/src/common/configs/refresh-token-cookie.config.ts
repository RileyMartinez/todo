import { config } from 'dotenv';
import { AppConstants } from '../constants';
import { CookieOptions } from 'express';

config();

if (!process.env.ENV) {
    throw new Error('ENV is not defined');
}

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

const isProduction = process.env.ENV === AppConstants.PROD;

export const RefreshTokenCookieConfig: CookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: maxAge,
};
