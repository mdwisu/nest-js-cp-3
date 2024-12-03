import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  find(email: string) {
    return this.userRepo.find({
      where: { email },
    });
  }

  create(name: string, email: string, password: string) {
    const user = this.userRepo.create({ name, email, password });
    return this.userRepo.save(user);
  }

  findOneBy(id: number) {
    const user = this.userRepo.findOneBy({ id });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async update(id: number, attrs: Partial<User>) {
    const user = await this.findOneBy(id);
    if (!user) {
      throw new Error('User not found');
    }
    Object.assign(user, attrs);
    return this.userRepo.save(user);
  }

  async remove(id: number) {
    const user = await this.findOneBy(id);
    if (!user) {
      throw new Error('User not found');
    }
    return this.userRepo.remove(user);
  }
}
