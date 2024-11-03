import { Injectable, OnModuleInit } from "@nestjs/common";
import { TaskService } from "../task/task.service";
import { Cron } from "@nestjs/schedule";
import { AuthorizationService } from "../authorization/authorization.service";
import { StatisticService } from "../statistic/statistic.service";

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
      dates.forEach((date) => {});
    }

    console.log("Maintenance finished");
  }

  private getDateRange(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }

  private getWeekRange(date: Date): { startDate: Date; endDate: Date } {
    const startOfWeek = new Date(date);
    const endOfWeek = new Date(date);

    const dayOfWeek = startOfWeek.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    startOfWeek.setDate(startOfWeek.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);

    endOfWeek.setDate(endOfWeek.getDate() + (6 - diff));
    endOfWeek.setHours(23, 59, 59, 999);

    return { startDate: startOfWeek, endDate: endOfWeek };
  }

  private getMonthRange(date: Date): { startDate: Date; endDate: Date } {
    const startOfMonth = new Date(date);
    const endOfMonth = new Date(date);

    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

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
}
