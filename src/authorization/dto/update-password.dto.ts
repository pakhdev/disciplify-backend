import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdatePasswordDto {

    @IsString()
    @MinLength(3)
    @MaxLength(20)
    oldPassword: string;

    @IsString()
    @MinLength(3)
    @MaxLength(20)
    newPassword: string;
}
