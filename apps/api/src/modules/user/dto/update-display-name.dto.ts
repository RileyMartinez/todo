import { IsOptional, IsString } from 'class-validator';

export class UpdateDisplayNameDto {
    @IsString()
    @IsOptional()
    displayName: string | null;

    constructor(displayName: string) {
        this.displayName = displayName;
    }
}
