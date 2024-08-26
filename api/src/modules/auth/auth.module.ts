import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/modules/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { jwtConfig } from '../../common/configs/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { OtpStrategy, JwtAuthStrategy, JwtRefreshStrategy } from './strategies';
import { ValidationService } from 'src/common/services/validaton.service';
import { EncryptionService } from '@/common';

@Module({
    imports: [ConfigModule, PassportModule, JwtModule.registerAsync(jwtConfig), UsersModule],
    controllers: [AuthController],
    providers: [AuthService, ValidationService, EncryptionService, OtpStrategy, JwtAuthStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
