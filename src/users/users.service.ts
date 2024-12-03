import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  create(name: string, email: string, password: string) {
    const user = this.userRepo.create({ name, email, password });
    return this.userRepo.save(user);
  }
}
