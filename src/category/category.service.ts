import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { User } from '../authorization/entities/user.entity';

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(Category)
        private readonly categoriesRepository: Repository<Category>,
    ) {}

    async create(createCategoryDto: CreateCategoryDto, user: User): Promise<{ id: number; name: string }> {
        const { name } = createCategoryDto;
        const category = this.categoriesRepository.create({ name, user });
        const savedCategory = await this.categoriesRepository.save(category);
        return {
            id: savedCategory.id,
            name: savedCategory.name,
        };
    }

    async findById(id: number, user: User): Promise<Category> {
        const category = await this.categoriesRepository.findOne({
            where: { id, user },
        });
        if (!category) throw new Error('Category not found');
        return category;
    }

    async findWithIds(ids: number[], user: User): Promise<Category[]> {
        return await this.categoriesRepository.find({
            where: { id: In(ids), user },
        });
    }

    async findAll(user: User): Promise<Category[]> {
        return await this.categoriesRepository.find({ where: { user } });
    }

    async update(id: number, updateCategoryDto: UpdateCategoryDto, user: User): Promise<Category> {
        let category = await this.findById(id, user);
        const { name } = updateCategoryDto;
        category = { ...category, name };
        return await this.categoriesRepository.save(category);
    }

    async remove(id: number, user: User): Promise<void> {
        await this.categoriesRepository.delete({ id, user });
    }
}
