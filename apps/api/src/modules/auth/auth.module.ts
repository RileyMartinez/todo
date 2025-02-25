import { EncryptionUtil } from '@/common/utils/encryption.util';
import { UrlUtil } from '@/common/utils/url.util';
import { ValidationUtil } from '@/common/utils/validaton.util';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/modules/users/users.module';
import { jwtConfig } from '../../common/configs/jwt.config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DiscordAuthStrategy } from './strategies/discord-auth.strategy';
import { GitHubAuthStrategy } from './strategies/github-auth.strategy';
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
        UrlUtil,
        LocalStrategy,
        OtpStrategy,
        JwtAuthStrategy,
        JwtRefreshStrategy,
        GoogleAuthStrategy,
        GitHubAuthStrategy,
        DiscordAuthStrategy,
    ],
})
export class AuthModule {}
