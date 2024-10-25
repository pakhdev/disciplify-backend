import { PartialType } from "@nestjs/mapped-types";
import { CreateCategoryDto } from "./create-category.dto";
import { IsString, MaxLength, MinLength } from "class-validator";

export class UpdateCategoryDto {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  name: string;
}
