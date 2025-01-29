import { ConfigService } from '@nestjs/config';
import { CookieOptions } from 'express';

export const cookieConfigFactory = (configService: ConfigService, expirationKey: string): CookieOptions => {
    const expiration = configService.getOrThrow<string>(expirationKey);
    const maxAge = parseExpiration(expiration);

    return {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: maxAge,
    };
};

export const invalidTokenCookieConfig: CookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 0,
};

const parseExpiration = (expiration: string): number => {
    const expirationValue = parseInt(expiration);

    if (isNaN(expirationValue)) {
        throw new Error('Expiration value is not a number');
    }

    const expirationUnit = expiration.replace(expirationValue.toString(), '').trim();

    if (!['d', 'h', 'm', 's'].includes(expirationUnit)) {
        throw new Error('Expiration unit is not valid');
    }

    return (
        expirationValue *
        (expirationUnit === 'd' ? 24 * 60 * 60 : expirationUnit === 'h' ? 60 * 60 : expirationUnit === 'm' ? 60 : 1) *
        1000
    );
};
