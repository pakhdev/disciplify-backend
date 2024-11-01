import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../authorization/entities/user.entity";

@Entity()
export class MonthStatistic {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @ManyToOne(() => User, (user) => user.monthStatistics)
  user: User;

  @Column()
  points: number;

  @Column()
  percentage: number;

  @Column()
  isOptional: boolean;

  @Column()
  month: number;
}
