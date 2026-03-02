import { EncryptionUtil } from '@/shared/utils/encryption.util';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

/**
 * Global module providing cross-cutting infrastructure utilities.
 *
 * Because this module is decorated with `@Global()`, its exports are
 * available to every module in the application without explicit imports.
 */
@Global()
@Module({
    imports: [ConfigModule],
    providers: [EncryptionUtil],
    exports: [EncryptionUtil],
})
export class CoreModule {}
