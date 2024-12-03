import {
  AfterInsert,
  AfterUpdate,
  AfterRemove,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

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
