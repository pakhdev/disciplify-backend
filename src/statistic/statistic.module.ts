import { Module } from "@nestjs/common";
import { StatisticService } from "./statistic.service";
import { StatisticController } from "./statistic.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DayStatistic } from "./entities/day-statistic.entity";
import { WeekStatistic } from "./entities/week-statistic.entity";
import { MonthStatistic } from "./entities/month-statistic.entity";
import { AuthorizationModule } from "../authorization/authorization.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([DayStatistic, WeekStatistic, MonthStatistic]),
    AuthorizationModule,
  ],
  controllers: [StatisticController],
  providers: [StatisticService],
  exports: [StatisticService],
})
export class StatisticModule {}
