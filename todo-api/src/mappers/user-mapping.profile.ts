import { Mapper, MappingProfile, createMap } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { SafeUserDto } from 'src/users/dto/safe-user.dto';
import { User } from 'src/users/entities/user.entity';

export class UserMappingProfile extends AutomapperProfile {
    constructor(@InjectMapper() mapper: Mapper) {
        super(mapper);
    }

    get profile(): MappingProfile {
        return (mapper) => {
            createMap(mapper, User, SafeUserDto);
        };
    }
}
