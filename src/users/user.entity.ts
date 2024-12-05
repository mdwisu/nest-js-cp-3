import { Exclude } from 'class-transformer';
import {
  AfterInsert,
  AfterUpdate,
  AfterRemove,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Item } from '../items/item.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  @Exclude()
  password: string;

  @OneToMany(() => Item, (item) => item.user)
  items: Item[];

  @AfterInsert()
  logInsert() {
    console.log('User was inserted with id: ' + this.id);
  }

  @AfterUpdate()
  logUpdate() {
    console.log('User was updated with id: ' + this.id);
  }

  @AfterRemove()
  logRemove() {
    console.log('User was removed with id: ' + this.id);
  }
}
