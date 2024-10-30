import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Category } from "../../category/entities/category.entity";
import { Task } from "../../task/entities/task.entity";
import { DayStatistic } from "../../statistic/entities/day-statistic.entity";
import { WeekStatistic } from "../../statistic/entities/week-statistic.entity";
import { MonthStatistic } from "../../statistic/entities/month-statistic.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column("varchar", { unique: true, length: 20 })
  name: string;

  @Column("varchar", { select: false })
  password: string;

  @Column({ default: () => "NOW()" })
  statisticDate: Date;

  @OneToMany(() => Category, (category) => category.user)
  categories: Category[];

  @OneToMany(() => Task, (task) => task.user)
  tasks: Task[];

  @OneToMany(() => DayStatistic, (dayStatistic) => dayStatistic.user)
  dayStatistics: DayStatistic[];

  @OneToMany(() => WeekStatistic, (weekStatistic) => weekStatistic.user)
  weekStatistics: WeekStatistic[];

  @OneToMany(() => MonthStatistic, (monthStatistic) => monthStatistic.user)
  monthStatistics: MonthStatistic[];

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.name = this.name.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}
