import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  public id!: string;

  @Column()
  public email!: string;

  @Column()
  public passwordHash!: string;

  @Column()
  public salt!: string;

  @Column()
  public name!: string;
}
