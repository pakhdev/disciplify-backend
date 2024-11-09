import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthorizationModule } from '../authorization/authorization.module';
import { CategoryModule } from '../category/category.module';
import { Task } from './entities/task.entity';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Task]),
        AuthorizationModule,
        CategoryModule,
    ],
    controllers: [TaskController],
    providers: [TaskService],
    exports: [TaskService],
})
export class TaskModule {}
