import { config } from 'dotenv';
import { AppConstants } from '../constants';
import { CookieOptions } from 'express';

config();

if (!process.env.ENV) {
    throw new Error('ENV is not defined');
}

const isProduction = process.env.ENV === AppConstants.PROD;

export const invalidTokenCookieConfig: CookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 0,
};
