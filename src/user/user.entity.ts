/* eslint-disable prettier/prettier */
import {
  Entity,
  Column,
  ObjectIdColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('User')
export class User {
  @ObjectIdColumn()
  _id: string;

  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column()
  user_name: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  bookmarks: string[];

  @Column({ nullable: true })
  likedProjects: string[];
}
