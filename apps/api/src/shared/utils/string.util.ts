import { v4 as uuidv4 } from 'uuid';

export const getUniqueName = (name: string) => `${name.toLowerCase()}-${uuidv4()}`;

/**
 * Converts a shorthand expiration time to a friendly readable format.
 *
 * @param expiration - The expiration string (e.g., "15d", "30m", "1h", "45s")
 * @returns The friendly expiration string (e.g., "15 days", "30 minutes", "1 hour", "45 seconds")
 * @throws Error if the expiration format is invalid
 */
export const getFriendlyExpiration = (expiration: string): string => {
    const expirationValue = parseInt(expiration);

    if (isNaN(expirationValue)) {
        throw new Error('Expiration value is not a number');
    }

    const expirationUnit = expiration.replace(expirationValue.toString(), '').trim();

    switch (expirationUnit) {
        case 'd':
            return `${expirationValue} ${expirationValue === 1 ? 'day' : 'days'}`;
        case 'h':
            return `${expirationValue} ${expirationValue === 1 ? 'hour' : 'hours'}`;
        case 'm':
            return `${expirationValue} ${expirationValue === 1 ? 'minute' : 'minutes'}`;
        case 's':
            return `${expirationValue} ${expirationValue === 1 ? 'second' : 'seconds'}`;
        default:
            throw new Error('Expiration unit is not valid');
    }
};
