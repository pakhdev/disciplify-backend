import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../authorization/entities/user.entity";

@Entity()
export class DayStatistic {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @ManyToOne(() => User, (user) => user.dayStatistics)
  user: User;

  @Column()
  points: number;

  @Column()
  percentage: number;

  @Column()
  isOptional: boolean;

  @Column({ type: "date", nullable: false })
  date: Date;
}
