import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  find() {
    return this.userRepo.find();
  }

  create(name: string, email: string, password: string) {
    const user = this.userRepo.create({ name, email, password });
    return this.userRepo.save(user);
  }

  findOneBy(id: number) {
    return this.userRepo.findOneBy({ id });
  }

  // update(id: number, attrs: Partial<User>) {
  //   return this.userRepo.update(id, attrs);
  // }

  // remove(id: number) {
  //   return this.userRepo.delete(id);
  // }
}
