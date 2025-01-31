import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/modules/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { jwtConfig } from '../../common/configs/jwt.config';
import { ConfigModule } from '@nestjs/config';
import {
    OtpStrategy,
    JwtAuthStrategy,
    JwtRefreshStrategy,
    LocalStrategy,
    GoogleAuthStrategy,
    AzureAdAuthStrategy,
} from './strategies';
import { EncryptionUtil, ValidationUtil } from '@/common';

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
        AzureAdAuthStrategy,
    ],
})
export class AuthModule {}
