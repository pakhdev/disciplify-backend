import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { envConfig } from '../config/env.config';
import { JoiValidationSchema } from '../config/joi.validation';
import { TypeOrmModule } from '@nestjs/typeorm';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
