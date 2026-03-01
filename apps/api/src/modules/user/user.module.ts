import { EncryptionUtil } from '@/shared/utils/encryption.util';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailModule } from '@/modules/email/email.module';
import { User } from '@/modules/user/entities/user.entity';
import { UserController } from '@/modules/user/user.controller';
import { UserService } from '@/modules/user/user.service';

@Module({
    imports: [TypeOrmModule.forFeature([User]), ConfigModule, EmailModule],
    controllers: [UserController],
    providers: [UserService, EncryptionUtil, JwtService],
    exports: [UserService],
})
export class UsersModule {}
