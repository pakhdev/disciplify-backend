import { DayStatistic } from "../entities/day-statistic.entity";
import { MonthStatistic } from "../entities/month-statistic.entity";
import { WeekStatistic } from "../entities/week-statistic.entity";

export class UserStatisticsDto {
  dayStatistics: DayStatistic[];
  weekStatistics: WeekStatistic[];
  monthStatistics: MonthStatistic[];
}
