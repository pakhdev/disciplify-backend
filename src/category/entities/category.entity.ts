import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../../authorization/entities/user.entity";

@Entity()
export class Category {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column("varchar", { unique: true, length: 20 })
  name: string;

  @ManyToOne(() => User, (user) => user.categories)
  @JoinColumn({ name: "user_id" })
  user: User;
}
