import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn
} from "typeorm";
import { Identity } from "./identity";

@Entity()
export class AccessLog extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  public id!: string;

  @Column({ type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" })
  public timestamp!: Date;

  @Column()
  public authorized!: boolean;

  @ManyToOne(_type => Identity, {
    nullable: true,
    eager: true
  })
  @JoinColumn()
  public identity?: Identity;

  @Column({ nullable: true })
  public confidence?: number;
}
