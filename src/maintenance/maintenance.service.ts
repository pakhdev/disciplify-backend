import { Injectable, OnModuleInit } from "@nestjs/common";
import { TaskService } from "../task/task.service";
import { Cron } from "@nestjs/schedule";
import { AuthorizationService } from "../authorization/authorization.service";
import { StatisticService } from "../statistic/statistic.service";
import { User } from "../authorization/entities/user.entity";

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

  @Cron("1 0 * * * *")
  async runMaintenance() {
    console.log("Running maintenance");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const users =
      await this.authorizationService.findUsersWithOldStatisticDate();
    for (const user of users) {
      console.log(`Maintenance for user ${user.id}`);
      const dates = this.getDateRange(user.statisticDate, today);
      for (const date of dates) {
        console.log("DATE", date);
        await this.performMaintenanceForDate(date, user);
      }
      await this.authorizationService.markStatisticDate(new Date(), user);
    }

    console.log("Maintenance finished");
  }

  private async performMaintenanceForDate(
    date: Date,
    user: User,
  ): Promise<void> {
    const tasks = await this.taskService.findByDate(date, user);
    const dateStatistic = this.statisticService.calculateStatsForDay(tasks);

    const currentDayWeekNumber = this.getWeekNumber(date);
    const currentDayMonthNumber = this.getMonthNumber(date);

    const nextDay = this.getNextDayDate(date);
    const nextDayWeekNumber = this.getWeekNumber(nextDay);
    const nextDayMonthNumber = this.getMonthNumber(nextDay);

    await this.statisticService.saveDayStatistic(date, dateStatistic, user);

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
      if (
        monthStatisticValues.length !==
        this.getDaysInMonth(
          this.getYearNumber(date),
          this.getMonthNumber(date),
        ) *
          2
      )
        return;

      const monthStatistic =
        this.statisticService.calculateAverageScore(monthStatisticValues);
      await this.statisticService.saveMonthStatistic(
        currentDayMonthNumber,
        monthStatistic,
        user,
      );
    }
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
}
