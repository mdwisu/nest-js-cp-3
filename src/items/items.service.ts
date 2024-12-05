import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from './item.entity';
import { Repository } from 'typeorm';
import { CreateItemDto } from './dtos/create-item.dto';
import { User } from '../users/user.entity';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item) private readonly itemRepo: Repository<Item>,
  ) {}

  create(item: CreateItemDto, user: User) {
    const newItem = this.itemRepo.create(item);
    newItem.user = user;
    return this.itemRepo.save(newItem);
  }
}
