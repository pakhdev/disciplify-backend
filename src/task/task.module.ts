import { Module } from "@nestjs/common";
import { TaskService } from "./task.service";
import { TaskController } from "./task.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Task } from "./entities/task.entity";
import { AuthorizationModule } from "../authorization/authorization.module";
import { CategoryModule } from "../category/category.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    AuthorizationModule,
    CategoryModule,
  ],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
