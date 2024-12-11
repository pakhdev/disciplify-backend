import { IsString, MinLength } from 'class-validator';

export class CheckNameDto {

    @IsString()
    @MinLength(3)
    name: string;

}
