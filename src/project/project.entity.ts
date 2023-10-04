/* eslint-disable prettier/prettier */
import {
  Column,
  Entity,
  ObjectIdColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('Project')
export class Project {
  @ObjectIdColumn()
  _id: string;

  @PrimaryGeneratedColumn('uuid')
  project_id: string;

  @Column()
  username: string;

  @Column({ unique: true })
  project_name: string;

  @Column()
  target_amount: number;

  @Column({ nullable: true })
  pledge_amount: number;

  @Column({ nullable: true })
  description: string;

  @Column()
  end_date: string;

  @Column()
  image: string;

  @Column()
  comments: string[];

  @Column()
  catagory: string;

  @Column()
  likes: number;

  @Column()
  pledges: number;
}
