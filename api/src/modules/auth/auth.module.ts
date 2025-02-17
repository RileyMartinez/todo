import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/modules/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { jwtConfig } from '../../common/configs/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { EncryptionUtil } from '@/common/utils/encryption.util';
import { ValidationUtil } from '@/common/utils/validaton.util';
import { GoogleAuthStrategy } from './strategies/google-auth.strategy';
import { JwtAuthStrategy } from './strategies/jwt-auth.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { OtpStrategy } from './strategies/otp.strategy';

@Module({
    imports: [ConfigModule, PassportModule, JwtModule.registerAsync(jwtConfig), UsersModule],
    controllers: [AuthController],
    providers: [
        AuthService,
        ValidationUtil,
        EncryptionUtil,
        LocalStrategy,
        OtpStrategy,
        JwtAuthStrategy,
        JwtRefreshStrategy,
        GoogleAuthStrategy,
    ],
})
export class AuthModule {}
