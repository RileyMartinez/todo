import { Injectable } from '@nestjs/common';
import { CreateEmailDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';

@Injectable()
export class EmailService {
    create(createEmailDto: CreateEmailDto) {
        return 'This action adds a new messaging';
    }

    findAll() {
        return `This action returns all messaging`;
    }

    findOne(id: number) {
        return `This action returns a #${id} messaging`;
    }

    update(id: number, updateEmailDto: UpdateEmailDto) {
        return `This action updates a #${id} messaging`;
    }

    remove(id: number) {
        return `This action removes a #${id} messaging`;
    }
}
