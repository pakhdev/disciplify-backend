import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthorizationModule } from '../authorization/authorization.module';
import { Category } from './entities/category.entity';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

@Module({
    imports: [TypeOrmModule.forFeature([Category]), AuthorizationModule],
    controllers: [CategoryController],
    providers: [CategoryService],
    exports: [CategoryService],
})
export class CategoryModule {}
