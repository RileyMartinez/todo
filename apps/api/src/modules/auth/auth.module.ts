import { jwtConfig } from '@/config/jwt.config';
import { EncryptionUtil } from '@/shared/utils/encryption.util';
import { UrlUtil } from '@/shared/utils/url.util';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '@/modules/user/user.module';
import { AuthController } from '@/modules/auth/auth.controller';
import { AuthService } from '@/modules/auth/auth.service';
import { MicrosoftGraphService } from '@/modules/auth/microsoft-graph.service';
import { DiscordAuthStrategy } from '@/modules/auth/strategies/discord-auth.strategy';
import { FacebookAuthStrategy } from '@/modules/auth/strategies/facebook-auth.strategy';
import { GitHubAuthStrategy } from '@/modules/auth/strategies/github-auth.strategy';
import { GoogleAuthStrategy } from '@/modules/auth/strategies/google-auth.strategy';
import { JwtAuthStrategy } from '@/modules/auth/strategies/jwt-auth.strategy';
import { JwtRefreshStrategy } from '@/modules/auth/strategies/jwt-refresh.strategy';
import { LocalStrategy } from '@/modules/auth/strategies/local.strategy';
import { MicrosoftAuthStrategy } from '@/modules/auth/strategies/microsoft-auth.strategy';
import { OtpStrategy } from '@/modules/auth/strategies/otp.strategy';

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
