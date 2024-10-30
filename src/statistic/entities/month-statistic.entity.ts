import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../authorization/entities/user.entity";
import { ScoreType } from "../enums/score-type.enum";

@Entity()
export class MonthStatistic {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @ManyToOne(() => User, (user) => user.monthStatistics)
  user: User;

  @Column({ type: "enum", enum: ScoreType })
  scoreType: ScoreType;

  @Column()
  score: number;

  @Column()
  isOptional: boolean;

  @Column()
  month: number;
}
