import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateDisplayNameDto {
    @IsString()
    @IsNotEmpty()
    displayName: string;

    constructor(displayName: string) {
        this.displayName = displayName;
    }
}
