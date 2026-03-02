import { jwtConfig } from '@/config/jwt.config';
import { EmailModule } from '@/modules/email/email.module';
import { User } from '@/modules/user/entities/user.entity';
import { UserNotificationService } from '@/modules/user/user-notification.service';
import { UserProfileService } from '@/modules/user/user-profile.service';
import { UserTokenService } from '@/modules/user/user-token.service';
import { UserController } from '@/modules/user/user.controller';
import { UserService } from '@/modules/user/user.service';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([User]), ConfigModule, EmailModule, JwtModule.registerAsync(jwtConfig)],
    controllers: [UserController],
    providers: [UserService, UserTokenService, UserProfileService, UserNotificationService],
    exports: [UserService, UserTokenService, UserProfileService, UserNotificationService],
})
export class UsersModule {}
