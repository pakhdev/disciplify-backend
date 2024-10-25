import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Category } from "../../category/entities/category.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column("varchar", { unique: true, length: 20 })
  name: string;

  @Column("varchar", { select: false })
  password: string;

  @OneToMany(() => Category, (category) => category.user)
  categories: Category[];

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.name = this.name.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}
