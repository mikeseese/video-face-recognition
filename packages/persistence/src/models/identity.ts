import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity()
export class Identity extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  public id!: string;

  @Column({ type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" })
  public created!: Date;

  @Column()
  public name!: string;

  @Column({ default: true })
  public authorized!: boolean;
}
