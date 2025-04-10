import { jwtConfig } from '@/app/core/configs/jwt.config';
import { EncryptionUtil } from '@/app/core/utils/encryption.util';
import { UrlUtil } from '@/app/core/utils/url.util';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MicrosoftGraphService } from './microsoft-graph.service';
import { DiscordAuthStrategy } from './strategies/discord-auth.strategy';
import { FacebookAuthStrategy } from './strategies/facebook-auth.strategy';
import { GitHubAuthStrategy } from './strategies/github-auth.strategy';
import { GoogleAuthStrategy } from './strategies/google-auth.strategy';
import { JwtAuthStrategy } from './strategies/jwt-auth.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { MicrosoftAuthStrategy } from './strategies/microsoft-auth.strategy';
import { OtpStrategy } from './strategies/otp.strategy';

@Module({
    imports: [ConfigModule, PassportModule, JwtModule.registerAsync(jwtConfig), UsersModule, HttpModule],
    controllers: [AuthController],
    providers: [
        AuthService,
        EncryptionUtil,
        UrlUtil,
        LocalStrategy,
        OtpStrategy,
        JwtAuthStrategy,
        JwtRefreshStrategy,
        GoogleAuthStrategy,
        MicrosoftAuthStrategy,
        GitHubAuthStrategy,
        DiscordAuthStrategy,
        FacebookAuthStrategy,
        MicrosoftGraphService,
    ],
})
export class AuthModule {}
