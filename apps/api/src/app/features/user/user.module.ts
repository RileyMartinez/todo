import { EncryptionUtil } from '@/app/core/utils/encryption.util';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailModule } from '../email/email.module';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
    imports: [TypeOrmModule.forFeature([User]), ConfigModule, EmailModule],
    controllers: [UserController],
    providers: [UserService, EncryptionUtil, JwtService],
    exports: [UserService],
})
export class UsersModule {}
