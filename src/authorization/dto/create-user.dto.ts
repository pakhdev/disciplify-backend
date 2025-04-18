import {
    IsEmail,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';

export class CreateUserDto {
    @IsString()
    @MinLength(3)
    @MaxLength(20)
    name: string;

    @IsString()
    @MinLength(3)
    @MaxLength(25)
    password: string;
}
