import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Category } from './entities/category.entity';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { GetUser } from '../authorization/decorators/get-user.decorator';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { User } from '../authorization/entities/user.entity';

@Controller('category')
@UseGuards(AuthGuard())
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @Post()
    create(@Body() createCategoryDto: CreateCategoryDto, @GetUser() user: User): Promise<{ id: number; name: string }> {
        return this.categoryService.create(createCategoryDto, user);
    }

    @Get()
    findAll(@GetUser() user: User): Promise<Category[]> {
        return this.categoryService.findAll(user);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto, @GetUser() user: User): Promise<Category> {
        return this.categoryService.update(+id, updateCategoryDto, user);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @GetUser() user: User): Promise<void> {
        return this.categoryService.remove(+id, user);
    }
}
