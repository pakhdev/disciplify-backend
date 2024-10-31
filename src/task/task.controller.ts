import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { TaskService } from "./task.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { AuthGuard } from "@nestjs/passport";
import { GetUser } from "../authorization/decorators/get-user.decorator";
import { User } from "../authorization/entities/user.entity";
import { Task } from "./entities/task.entity";

@Controller("task")
@UseGuards(AuthGuard())
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  create(
    @Body() createTaskDto: CreateTaskDto,
    @GetUser() user: User,
  ): Promise<Task> {
    return this.taskService.create(createTaskDto, user);
  }

  @Get()
  findAll(@GetUser() user: User): Promise<Task[]> {
    return this.taskService.findAll(user);
  }

  @Get("finished")
  findAllRemoved(@GetUser() user: User): Promise<Task[]> {
    return this.taskService.findAllFinished(user);
  }

  @Patch("record/:id")
  record(@Param("id") id: string, @GetUser() user: User): Promise<Task> {
    return this.taskService.record(+id, user);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @GetUser() user: User,
  ) {
    // return this.taskService.update(+id, updateTaskDto);
    return "must be implemented";
  }

  @Delete(":id")
  remove(@Param("id") id: string, @GetUser() user: User): Promise<void> {
    return this.taskService.remove(+id, user);
  }
}
