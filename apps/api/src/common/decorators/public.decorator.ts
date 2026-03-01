import { SetMetadata } from '@nestjs/common';
import { DecoratorConstants } from '@/shared/constants/decorator.constants';

export const Public = () => SetMetadata(DecoratorConstants.IS_PUBLIC_KEY, true);
