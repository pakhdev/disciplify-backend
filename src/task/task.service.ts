import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { TaskType } from "./enums/task-type.enum";
import { envConfig } from "../../config/env.config";
import { User } from "../authorization/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Task } from "./entities/task.entity";
import { Between, FindOneOptions, In, Repository } from "typeorm";
import { CategoryService } from "../category/category.service";

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    private readonly categoriesRepository: CategoryService,
  ) {}

  async create(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const {
      type,
      difficulty,
      iterationLimit,
      initAt,
      categoryIds,
      ...taskData
    } = createTaskDto;
    const maxScore = this.calculateMaxScore(difficulty, iterationLimit);
    const currentScore = type === TaskType.TO_DO ? 0 : maxScore;
    const categories = await this.categoriesRepository.findWithIds(
      categoryIds,
      user,
    );
    const task = this.tasksRepository.create({
      ...taskData,
      categories,
      currentScore,
      difficulty,
      initAt,
      iterationLimit,
      maxScore,
      nextActivationAt: initAt,
      type,
      user,
    });
    return this.tasksRepository.save(task);
  }

  async findAll(user: User) {
    return await this.tasksRepository.find({
      where: { finished: false, user },
      relations: ["categories"],
    });
  }

  async findAllFinished(user: User) {
    return await this.tasksRepository.find({
      where: { finished: true, user },
      relations: ["categories"],
    });
  }

  async findById(
    id: number,
    user: User,
    todayOnly: boolean = false,
  ): Promise<Task> {
    const options: FindOneOptions<Task> = { where: { id, user } };
    if (todayOnly) {
      const [startOfDay, endOfDay] = this.getTodayRange(new Date());
      options.where["nextActivationAt"] = Between(startOfDay, endOfDay);
    }

    const task = await this.tasksRepository.findOne(options);
    if (!task) throw new Error("Task not found");
    return task;
  }

  async findByDate(date: Date, user: User): Promise<Task[]> {
    const [startOfDay, endOfDay] = this.getTodayRange(date);
    return this.tasksRepository.find({
      where: {
        nextActivationAt: Between(startOfDay, endOfDay),
      },
    });
  }

  update(id: number, updateTaskDto: UpdateTaskDto, user: User) {
    return `This action updates a #${id} task`;
  }

  async record(id: number, user: User): Promise<Task> {
    const task = await this.findById(id, user, true);
    if (task.iterationCount >= task.iterationLimit)
      throw new BadRequestException("Iteration can't be recorded");

    const points = envConfig().basePoints * task.difficulty;
    task.type === TaskType.TO_DO
      ? (task.currentScore += points)
      : (task.currentScore -= points);
    task.iterationCount++;

    return await this.tasksRepository.save(task);
  }

  async remove(id: number, user: User): Promise<void> {
    await this.tasksRepository.delete({ id, user });
  }

  private calculateMaxScore(
    difficulty: number,
    iterationLimit: number,
  ): number {
    return envConfig().basePoints * difficulty * iterationLimit;
  }

  private getTodayRange(date: Date): [Date, Date] {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    return [startOfDay, endOfDay];
  }
}
