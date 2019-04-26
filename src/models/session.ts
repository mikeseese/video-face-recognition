import {
  Entity,
  Column,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn
} from "typeorm";
import { SessionEntity } from "typeorm-store";
import { User } from "./user";

@Entity()
export class Session extends BaseEntity implements SessionEntity {
  @PrimaryGeneratedColumn("uuid")
  public id!: string;

  @ManyToOne(_type => User)
  @JoinColumn()
  public user!: User;

  @Column({ type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" })
  public created!: Date;

  @Column()
  public expiresAt!: number;

  @Column()
  public data!: string;

  @Column({ default: true })
  public valid!: boolean;
}
