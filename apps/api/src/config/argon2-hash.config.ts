import * as argon2 from 'argon2';

/**
 * Argon2 hash configuration.
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#argon2id
 */
export const argon2HashConfig: argon2.Options = {
    type: argon2.argon2id,
    memoryCost: 12288,
    timeCost: 3,
    parallelism: 1,
};
