import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthorizationModule } from '../authorization/authorization.module';
import { DayStatistic } from './entities/day-statistic.entity';
import { MonthStatistic } from './entities/month-statistic.entity';
import { StatisticController } from './statistic.controller';
import { StatisticService } from './statistic.service';
import { WeekStatistic } from './entities/week-statistic.entity';

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
