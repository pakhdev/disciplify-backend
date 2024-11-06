import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../authorization/entities/user.entity";

@Entity()
export class WeekStatistic {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @ManyToOne(() => User, (user) => user.weekStatistics)
  user: User;

  @Column()
  points: number;

  @Column()
  percentage: number;

  @Column()
  isOptional: boolean;

  @Column()
  week: number;

  @Column()
  year: number;
}
