import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/modules/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { jwtConfig } from '../../common/configs/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { LocalStrategy, JwtAuthStrategy, JwtRefreshStrategy } from './strategies';
import { ValidationService } from 'src/common/services/validaton.service';

@Module({
    imports: [ConfigModule, PassportModule, JwtModule.registerAsync(jwtConfig), UsersModule],
    controllers: [AuthController],
    providers: [AuthService, ValidationService, LocalStrategy, JwtAuthStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
