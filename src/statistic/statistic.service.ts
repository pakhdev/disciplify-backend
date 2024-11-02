import { Injectable } from "@nestjs/common";
import { User } from "../authorization/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { DayStatistic } from "./entities/day-statistic.entity";
import { Repository } from "typeorm";
import { MonthStatistic } from "./entities/month-statistic.entity";
import { WeekStatistic } from "./entities/week-statistic.entity";
import { envConfig } from "../../config/env.config";
import { UserStatisticsDto } from "./dto/user-statistics.dto";
import { Task } from "../task/entities/task.entity";
import { PeriodStatistics } from "./interfaces/period-statistics.interface";
import { TaskTypeStatistics } from "./interfaces/task-type-statistics.interface";

@Injectable()
export class StatisticService {
  constructor(
    @InjectRepository(DayStatistic)
    private readonly dayStatisticRepository: Repository<DayStatistic>,
    @InjectRepository(WeekStatistic)
    private readonly weekStatisticRepository: Repository<WeekStatistic>,
    @InjectRepository(MonthStatistic)
    private readonly monthStatisticRepository: Repository<MonthStatistic>,
  ) {}

  async findAll(user: User): Promise<UserStatisticsDto> {
    const fetchStats = (repo: Repository<any>, limit: number) =>
      repo.find({ where: { user }, take: limit, order: { id: "DESC" } });

    const config = envConfig();
    const [dayStatistics, weekStatistics, monthStatistics] = await Promise.all([
      fetchStats(this.dayStatisticRepository, +config.daysStatLimit * 2),
      fetchStats(this.weekStatisticRepository, +config.weeksStatLimit * 2),
      fetchStats(this.monthStatisticRepository, +config.monthsStatLimit * 2),
    ]);

    return { dayStatistics, weekStatistics, monthStatistics };
  }

  calculateStatsForDay(tasks: Task[]): PeriodStatistics {
    const calculateStats = (tasks: Task[]): TaskTypeStatistics => {
      const points = tasks.reduce((acc, task) => acc + task.currentScore, 0);
      const maxPoints = tasks.reduce((acc, task) => acc + task.maxScore, 0);
      return { points, percentage: maxPoints ? (points / maxPoints) * 100 : 0 };
    };

    return {
      mandatoryTasks: calculateStats(tasks.filter((task) => !task.isOptional)),
      optionalTasks: calculateStats(tasks.filter((task) => task.isOptional)),
    };
  }

  async calculateStatsForWeek(
    weekNumber: number,
    user: User,
  ): Promise<PeriodStatistics | void> {
    // Get start and end dates of the week
    // Find week statistic
    // If there's statistic of all days of the week, return it
    return;
  }

  async calculateStatsForMonth(
    monthNumber: number,
    user: User,
  ): Promise<PeriodStatistics | void> {
    // Get start and end dates of the month
    // Find month statistic
    // If there's statistic of all days of the month, return it
  }

  async saveDayStatistic(
    currentDay: Date,
    statistic: PeriodStatistics,
    user: User,
  ): Promise<void> {
    await this.saveStatistic(
      this.dayStatisticRepository,
      currentDay,
      statistic,
      user,
      "date",
    );
  }

  async saveWeekStatistic(
    weekNumber: number,
    statistic: PeriodStatistics,
    user: User,
  ): Promise<void> {
    await this.saveStatistic(
      this.weekStatisticRepository,
      weekNumber,
      statistic,
      user,
      "week",
    );
  }

  async saveMonthStatistic(
    monthNumber: number,
    statistic: PeriodStatistics,
    user: User,
  ): Promise<void> {
    await this.saveStatistic(
      this.monthStatisticRepository,
      monthNumber,
      statistic,
      user,
      "month",
    );
  }

  async saveStatistic<T extends DayStatistic | WeekStatistic | MonthStatistic>(
    repo: Repository<T>,
    periodValue: number | Date,
    statistic: PeriodStatistics,
    user: User,
    periodField: keyof T,
  ): Promise<void> {
    const createStat = (
      points: number,
      percentage: number,
      isOptional: boolean,
    ): T => {
      const stat = new (repo.target as any)();
      stat.user = user;
      stat[periodField] = periodValue;
      stat.points = points;
      stat.percentage = percentage;
      stat.isOptional = isOptional;
      return stat;
    };

    const stats = [
      createStat(
        statistic.mandatoryTasks.points,
        statistic.mandatoryTasks.percentage,
        false,
      ),
      createStat(
        statistic.optionalTasks.points,
        statistic.optionalTasks.percentage,
        true,
      ),
    ];

    await repo.save(stats);
  }
}
