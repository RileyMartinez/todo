import { Logger, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { jwtConfig } from '../config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
    imports: [ConfigModule, PassportModule, JwtModule.registerAsync(jwtConfig), UsersModule],
    controllers: [AuthController],
    providers: [AuthService, LocalStrategy, JwtAccessStrategy, JwtRefreshStrategy, Logger],
})
export class AuthModule {}
