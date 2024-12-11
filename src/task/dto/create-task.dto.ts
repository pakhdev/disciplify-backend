import {
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsDate,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsString,
    Max,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';

import { RestrictedDaysPolicy } from '../enums/restricted-days-policy.enum';
import { TaskType } from '../enums/task-type.enum';

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsEnum(TaskType)
    type: TaskType;

    @IsBoolean()
    isOptional: boolean;

    @IsBoolean()
    isRecurring: boolean;

    @IsNumber()
    @Min(1)
    difficulty: number;

    @IsNumber()
    @Min(1)
    @Max(99)
    iterationLimit: number;

    @IsDate()
    @Type(() => Date)
    initAt: Date;

    @Min(1)
    @IsNumber()
    repeatInterval: number;

    @IsNumber()
    allowedDays: number;

    @IsEnum(RestrictedDaysPolicy)
    restrictedDaysPolicy: RestrictedDaysPolicy;

    @IsArray()
    @ArrayMinSize(1)
    @IsNumber({}, { each: true })
    categoryIds: number[];
}
