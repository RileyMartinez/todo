import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    CipherGCMTypes,
    createCipheriv,
    createDecipheriv,
    Encoding,
    randomBytes,
    randomFillSync,
    scryptSync,
} from 'crypto';
import { ConfigConstants } from '../constants/config.constants';

const HEX_ENCODING: Encoding = 'hex';
const UTF8_ENCODING: Encoding = 'utf8';
const AES_256_GCM: CipherGCMTypes = 'aes-256-gcm';

@Injectable()
export class EncryptionUtil {
    private readonly logger = new Logger(EncryptionUtil.name);
    private encryptionKey: Buffer | undefined;

    constructor(private readonly configService: ConfigService) {}

    /**
     * Encrypts the given data using AES-256-GCM encryption algorithm.
     *
     * @param data - The data to be encrypted.
     * @returns The encrypted data in the format: iv:encrypted:authTag.
     * @see {@link https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html}
     */
    encrypt(data: string): string {
        try {
            const encryptionKey = this.getEncryptionKey();
            const iv = randomBytes(16);

            const cipher = createCipheriv(AES_256_GCM, encryptionKey, iv);
            let encrypted = cipher.update(data, UTF8_ENCODING, HEX_ENCODING);
            encrypted += cipher.final(HEX_ENCODING);
            const authTag = cipher.getAuthTag().toString(HEX_ENCODING);

            return `${iv.toString(HEX_ENCODING)}:${encrypted}:${authTag}`;
        } catch (error) {
            this.logger.error(error, 'Failed to encrypt data.');
            throw new BadRequestException('Failed to encrypt data.');
        }
    }

    /**
     * Decrypts the given encrypted data using AES-256-GCM encryption algorithm.
     *
     * @param encryptedData - The encrypted data to be decrypted.
     * @returns The decrypted data as a string.
     * @see {@link https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html}
     */
    decrypt(encryptedData: string): string {
        try {
            const encryptionKey = this.getEncryptionKey();
            const [ivHex, encrypted, authTagHex] = encryptedData.split(':');
            const iv = Buffer.from(ivHex, HEX_ENCODING);
            const authTag = Buffer.from(authTagHex, HEX_ENCODING);

            const decipher = createDecipheriv(AES_256_GCM, encryptionKey, iv);
            decipher.setAuthTag(authTag);
            let decrypted = decipher.update(encrypted, HEX_ENCODING, UTF8_ENCODING);
            decrypted += decipher.final(UTF8_ENCODING);

            return decrypted;
        } catch (error) {
            this.logger.error(error, 'Failed to decrypt data.');
            throw new InternalServerErrorException('Failed to decrypt data.');
        }
    }

    /**
     * Generates a random password of the specified length.
     *
     * @param length - The length of the password to generate.
     * @returns Randomly generated password.
     */
    generatePassword(length: number = 32): string {
        if (length < 1) {
            const errorMessage = 'Password length to generate must be greater than 0.';
            this.logger.error(length, errorMessage);
            throw new InternalServerErrorException(errorMessage);
        }

        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';
        return Array.from(randomFillSync(new Uint32Array(length)))
            .map((value) => characters[value % characters.length])
            .join('');
    }

    /**
     * Retrieves the encryption key used for encryption operations.
     * If the encryption key has already been generated, it is returned.
     * Otherwise, it generates the encryption key using the provided key and salt.
     *
     * @returns The encryption key as a Buffer.
     */
    private getEncryptionKey(): Buffer {
        if (this.encryptionKey) {
            return this.encryptionKey;
        }

        const key = this.configService.getOrThrow<string>(ConfigConstants.ENCRYPTION_KEY);
        const salt = this.configService.getOrThrow<string>(ConfigConstants.KDF_SALT);
        this.encryptionKey = scryptSync(key, salt, 32);

        return this.encryptionKey;
    }
}
