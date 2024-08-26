import { BadRequestException, Inject, Injectable, InternalServerErrorException, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigConstants, ExceptionConstants } from '../constants';
import { CipherGCMTypes, createCipheriv, createDecipheriv, Encoding, randomBytes, scryptSync } from 'crypto';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { formatLogMessage } from '../utils/logger.util';

const HEX_ENCODING: Encoding = 'hex';
const UTF8_ENCODING: Encoding = 'utf8';
const AES_256_GCM: CipherGCMTypes = 'aes-256-gcm';

@Injectable()
export class EncryptionService {
    private encryptionKey: Buffer | undefined;

    constructor(
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
        private readonly configService: ConfigService,
    ) {
        this.configService = configService;
        this.logger = logger;
    }

    /**
     * Encrypts the given data using AES-256-GCM encryption algorithm.
     *
     * @param data - The data to be encrypted.
     * @returns The encrypted data in the format: iv:encrypted:authTag.
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
            const stack = error instanceof Error ? error.stack : ExceptionConstants.UNKNOWN_ERROR;
            this.logger.error(formatLogMessage('ESEnc001', 'Failed to encrypt data.'), stack, EncryptionService.name);
            throw new BadRequestException('Failed to encrypt data.');
        }
    }

    /**
     * Decrypts the given encrypted data using AES-256-GCM encryption algorithm.
     *
     * @param encryptedData - The encrypted data to be decrypted.
     * @returns The decrypted data as a string.
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
            const stack = error instanceof Error ? error.stack : ExceptionConstants.UNKNOWN_ERROR;
            this.logger.error(formatLogMessage('ESDec001', 'Failed to decrypt data.'), stack, EncryptionService.name);
            throw new InternalServerErrorException('Failed to decrypt data.');
        }
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
