import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../authorization/entities/user.entity";
import { ScoreType } from "../enums/score-type.enum";

@Entity()
export class WeekStatistic {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @ManyToOne(() => User, (user) => user.weekStatistics)
  user: User;

  @Column({ type: "enum", enum: ScoreType })
  scoreType: ScoreType;

  @Column()
  score: number;

  @Column()
  isOptional: boolean;

  @Column()
  week: number;
}
