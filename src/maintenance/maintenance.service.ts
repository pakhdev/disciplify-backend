import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { AuthorizationService } from '../authorization/authorization.service';
import { StatisticService } from '../statistic/statistic.service';
import { TaskService } from '../task/task.service';
import { User } from '../authorization/entities/user.entity';
import { envConfig } from '../../config/env.config';

@Injectable()
export class MaintenanceService implements OnModuleInit {
    constructor(
        private readonly authorizationService: AuthorizationService,
        private readonly statisticService: StatisticService,
        private readonly taskService: TaskService,
    ) {}

    async onModuleInit() {
        await this.runMaintenance();
    }

    @Cron('1 0 * * * *')
    async runMaintenance() {
        console.log('Running maintenance');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const users =
            await this.authorizationService.findUsersWithOldStatisticDate();
        for (const user of users) {
            const dates = this.getDateRange(user.statisticDate, today);
            for (const date of dates) {
                await this.performMaintenanceForDate(date, user);
            }
            await this.authorizationService.markStatisticDate(new Date(), user);
        }

        await this.cleanupOldStatistics();
        console.log('Maintenance finished');
    }

    private async performMaintenanceForDate(
        date: Date,
        user: User,
    ): Promise<void> {
        const tasks = await this.taskService.findByDate(date, user);
        tasks.forEach((task) => this.taskService.finishTask);

        const dateStatistic = this.statisticService.calculateStatsForDay(tasks);

        const currentDayWeekNumber = this.getWeekNumber(date);
        const currentDayMonthNumber = this.getMonthNumber(date);
        const currentDayYearNumber = this.getYearNumber(date);

        const nextDay = this.getNextDayDate(date);
        const nextDayWeekNumber = this.getWeekNumber(nextDay);
        const nextDayMonthNumber = this.getMonthNumber(nextDay);

        await this.statisticService.saveDayStatistic(date, dateStatistic, user);

        tasks
            .filter((task) => task.isRecurring)
            .forEach((task) => this.taskService.resetTask(task));

        if (currentDayWeekNumber !== nextDayWeekNumber) {
            const weekRange = this.getWeekRange(date);
            const weekStatisticValues = await this.statisticService.findByDatesRange(
                weekRange.startDate,
                weekRange.endDate,
                user,
            );
            if (weekStatisticValues.length !== 14) return;
            const weekStatistic =
                this.statisticService.calculateAverageScore(weekStatisticValues);
            await this.statisticService.saveWeekStatistic(
                currentDayWeekNumber,
                currentDayYearNumber,
                weekStatistic,
                user,
            );
        }

        if (currentDayMonthNumber !== nextDayMonthNumber) {
            const monthRange = this.getMonthRange(date);
            const monthStatisticValues = await this.statisticService.findByDatesRange(
                monthRange.startDate,
                monthRange.endDate,
                user,
            );
            if (monthStatisticValues.length !== this.getDaysInMonth(this.getYearNumber(date), this.getMonthNumber(date)) * 2)
                return;

            const monthStatistic = this.statisticService.calculateAverageScore(monthStatisticValues);
            await this.statisticService.saveMonthStatistic(
                currentDayMonthNumber,
                currentDayYearNumber,
                monthStatistic,
                user,
            );
        }
    }

    private async cleanupOldStatistics() {
        const config = envConfig();
        const dayThreshold = this.calculateThresholdDay(35);
        const weekThreshold = this.calculateThresholdWeek(+config.weeksStatLimit);
        const monthThreshold = this.calculateThresholdMonth(+config.monthsStatLimit);

        await this.statisticService.purgeDayStatisticsBefore(dayThreshold);
        await this.statisticService.purgeWeekStatisticsBefore(weekThreshold.week, weekThreshold.year);
        await this.statisticService.purgeMonthStatisticsBefore(monthThreshold.month, monthThreshold.year);
    }

    private getDateRange(startDate: Date, endDate: Date): Date[] {
        const dates: Date[] = [];
        const currentDate = new Date(startDate);
        currentDate.setHours(23, 59, 59, 999);

        while (currentDate < endDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return dates;
    }

    private getWeekRange(date: Date): { startDate: Date; endDate: Date } {
        const inputDate = new Date(
            Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
        );

        const dayOfWeek = inputDate.getUTCDay();
        const diff = (dayOfWeek + 6) % 7;

        const startOfWeek = new Date(inputDate);
        startOfWeek.setUTCDate(startOfWeek.getUTCDate() - diff);
        startOfWeek.setUTCHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setUTCDate(endOfWeek.getUTCDate() + 6);
        endOfWeek.setUTCHours(23, 59, 59, 999);

        return { startDate: startOfWeek, endDate: endOfWeek };
    }

    private getMonthRange(date: Date): { startDate: Date; endDate: Date } {
        const inputDate = new Date(
            Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
        );

        const startOfMonth = new Date(inputDate);
        startOfMonth.setUTCDate(1);
        startOfMonth.setUTCHours(0, 0, 0, 0);

        const endOfMonth = new Date(inputDate);
        endOfMonth.setUTCMonth(endOfMonth.getUTCMonth() + 1);
        endOfMonth.setUTCDate(0);
        endOfMonth.setUTCHours(23, 59, 59, 999);

        return { startDate: startOfMonth, endDate: endOfMonth };
    }

    private getNextDayDate(date: Date): Date {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        return nextDay;
    }

    private getWeekNumber(date: Date): number {
        const d = new Date(
            Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
        );
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    }

    private getMonthNumber(date: Date): number {
        return date.getMonth() + 1;
    }

    private getYearNumber(date: string | Date): number {
        const parsedDate = new Date(date);
        return parsedDate.getFullYear();
    }

    private getDaysInMonth(year: number, month: number): number {
        return new Date(year, month, 0).getDate();
    }

    private calculateThresholdMonth(monthsAgo: number): {
        year: number;
        month: number;
    } {
        const date = new Date();
        date.setMonth(date.getMonth() - monthsAgo);

        return {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
        };
    }

    calculateThresholdWeek(weeksAgo: number): { year: number; week: number } {
        const date = new Date();
        date.setDate(date.getDate() - weeksAgo * 7);

        return {
            year: date.getFullYear(),
            week: this.getWeekNumber(date),
        };
    }

    calculateThresholdDay(daysAgo: number): Date {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        return date;
    }
}
