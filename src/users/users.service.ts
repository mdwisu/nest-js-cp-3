import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findOneBy(id: number) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: number, attrs: Partial<User>) {
    const user = await this.findOneBy(id);
    Object.assign(user, attrs);
    return this.userRepo.save(user);
  }

  async remove(id: number) {
    const user = await this.findOneBy(id);
    return this.userRepo.remove(user);
  }
}
