import { Controller, Get, UseGuards } from "@nestjs/common";
import { StatisticService } from "./statistic.service";
import { AuthGuard } from "@nestjs/passport";
import { GetUser } from "../authorization/decorators/get-user.decorator";
import { User } from "../authorization/entities/user.entity";
import { UserStatisticsDto } from "./dto/user-statistics.dto";

@Controller("statistic")
@UseGuards(AuthGuard())
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @Get()
  findAll(@GetUser() user: User): Promise<UserStatisticsDto> {
    return this.statisticService.findAll(user);
  }
}
