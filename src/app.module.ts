import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JoiValidationSchema } from '../config/joi.validation';
import { AuthorizationModule } from './authorization/authorization.module';
import { CategoryModule } from './category/category.module';
import { TaskModule } from './task/task.module';
import { ScheduleModule } from '@nestjs/schedule';
import { StatisticModule } from './statistic/statistic.module';
import { MaintenanceService } from './maintenance/maintenance.service';
import { envConfig } from '../config/env.config';

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [envConfig],
            validationSchema: JoiValidationSchema,
        }),
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: envConfig().mysqlHost,
            port: envConfig().mysqlPort,
            username: envConfig().mysqlUser,
            password: envConfig().mysqlPassword,
            database: envConfig().mysqlDbName,
            autoLoadEntities: true,
            synchronize: envConfig().mysqlSync,
        }),
        ScheduleModule.forRoot(),
        AuthorizationModule,
        CategoryModule,
        TaskModule,
        StatisticModule,
    ],
    providers: [MaintenanceService],
})
export class AppModule {}
