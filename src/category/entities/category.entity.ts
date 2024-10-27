import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../../authorization/entities/user.entity";
import { Task } from "../../task/entities/task.entity";

@Entity()
export class Category {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column("varchar", { unique: true, length: 20 })
  name: string;

  @ManyToMany(() => Task, (task) => task.categories)
  @JoinTable()
  tasks: Task[];

  @ManyToOne(() => User, (user) => user.categories)
  @JoinColumn({ name: "user_id" })
  user: User;
}
