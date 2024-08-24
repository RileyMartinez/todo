import { PartialType } from '@nestjs/mapped-types';
import { CreateEmailDto as CreateEmailDto } from './create-email.dto';

export class UpdateEmailDto extends PartialType(CreateEmailDto) {}
