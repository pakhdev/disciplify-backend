import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("text", { unique: true })
  name: string;

  @Column("text", { select: false })
  password: string;

  @Column("bool", { default: true })
  isActive: boolean;

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.name = this.name.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}
