import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/modules/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtConfig } from '../../common/configs/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { LocalStrategy, JwtAuthStrategy, JwtRefreshStrategy } from './strategies';

@Module({
    imports: [ConfigModule, PassportModule, JwtModule.registerAsync(JwtConfig), UsersModule],
    controllers: [AuthController],
    providers: [AuthService, LocalStrategy, JwtAuthStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
