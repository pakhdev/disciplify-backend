import { ConfigModule } from "@nestjs/config";
import { Module } from "@nestjs/common";
import { envConfig } from "../config/env.config";
import { JoiValidationSchema } from "../config/joi.validation";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthorizationModule } from "./authorization/authorization.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [envConfig],
      validationSchema: JoiValidationSchema,
    }),
    TypeOrmModule.forRoot({
      type: "mysql",
      host: envConfig().mysqlHost,
      port: envConfig().mysqlPort,
      username: envConfig().mysqlUser,
      password: envConfig().mysqlPassword,
      database: envConfig().mysqlDbName,
      autoLoadEntities: true,
      synchronize: envConfig().mysqlSync,
    }),
    AuthorizationModule,
  ],
})
export class AppModule {}
