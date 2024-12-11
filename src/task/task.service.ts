import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOneOptions, Repository } from 'typeorm';

import { CategoryService } from '../category/category.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { RestrictedDaysPolicy } from './enums/restricted-days-policy.enum';
import { Task } from './entities/task.entity';
import { TaskType } from './enums/task-type.enum';
import { UpdateTaskDto } from './dto/update-task.dto';
import { User } from '../authorization/entities/user.entity';
import { envConfig } from '../../config/env.config';

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
            relations: ['categories'],
        });
    }

    async findAllFinished(user: User) {
        return await this.tasksRepository.find({
            where: { finished: true, user },
            relations: ['categories'],
        });
    }

    async findById(id: number, user: User, todayOnly: boolean = false): Promise<Task> {
        const options: FindOneOptions<Task> = { where: { id, user } };
        if (todayOnly) {
            const [startOfDay, endOfDay] = this.getTodayRange(new Date());
            options.where['nextActivationAt'] = Between(startOfDay, endOfDay);
        }

        const task = await this.tasksRepository.findOne(options);
        if (!task) throw new Error('Task not found');
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
        return `This action updates a #${ id } task`;
    }

    async record(id: number, user: User): Promise<Task> {
        const task = await this.findById(id, user, true);
        if (task.iterationCount >= task.iterationLimit)
            throw new BadRequestException('Iteration can\'t be recorded');

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

    async resetTask(task: Task): Promise<void> {
        task.iterationCount = 0;
        task.currentScore = task.type === TaskType.TO_DO ? 0 : task.maxScore;
        task.nextActivationAt = this.calculateNextActivationDate(task);
        await this.tasksRepository.save(task);
    }

    async finishTask(task: Task): Promise<void> {
        if (task.isRecurring) return;
        task.finished = true;
        await this.tasksRepository.save(task);
    }

    public calculateNextActivationDate(task: Task): Date {
        const currentActivationDate = task.nextActivationAt;
        const allowedDays = this.decodeDays(task.allowedDays);
        if (allowedDays.length === 0)
            throw new BadRequestException('Allowed days are not set');

        let supposedDate = this.addDaysToDate(currentActivationDate, task.repeatInterval);

        if (task.restrictedDaysPolicy === RestrictedDaysPolicy.BEFORE) {
            let nextActivationDate = this.findAllowedDayBetweenDates(
                currentActivationDate,
                supposedDate,
                allowedDays,
            );
            if (nextActivationDate) return nextActivationDate;
        }

        return this.findAllowedDayFrom(supposedDate, allowedDays);
    }

    private calculateMaxScore(difficulty: number, iterationLimit: number): number {
        return envConfig().basePoints * difficulty * iterationLimit;
    }

    private getTodayRange(date: Date): [Date, Date] {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        return [startOfDay, endOfDay];
    }

    private decodeDays(value: number): number[] {
        return [...Array(7).keys()]
            .map((i) => i + 1)
            .filter((day) => value & (1 << (day - 1)));
    }

    private findAllowedDayBetweenDates(stopDate: Date, checkDate: Date, allowedDays: number[]): Date | null {
        checkDate.setHours(0, 0, 0, 0);
        stopDate.setHours(0, 0, 0, 0);
        while (checkDate !== stopDate) {
            const dayOfWeek = this.getDayOfWeek(checkDate);
            if (allowedDays.includes(dayOfWeek)) return checkDate;
            checkDate.setDate(checkDate.getDate() - 1);
        }
        return null;
    }

    private findAllowedDayFrom(checkDate: Date, allowedDays: number[]): Date {
        checkDate.setHours(0, 0, 0, 0);
        checkDate.setDate(checkDate.getDate() + 1);
        if (allowedDays.includes(this.getDayOfWeek(checkDate))) return checkDate;
        return this.findAllowedDayFrom(checkDate, allowedDays);
    }

    private addDaysToDate(date: Date, daysToAdd: number): Date {
        date.setDate(date.getDate() + daysToAdd);
        date.setHours(0, 0, 0, 0);
        return date;
    }

    private getDayOfWeek(date: Date): number {
        const day = date.getDay();
        return day === 0 ? 7 : day;
    }
}
