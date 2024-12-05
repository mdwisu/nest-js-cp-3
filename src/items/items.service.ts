import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from './item.entity';
import { Repository } from 'typeorm';
import { CreateItemDto } from './dtos/create-item.dto';
import { User } from '../users/user.entity';
import { ApproveItemDto } from './dtos/approve-item.dto';
import { QueryItemDto } from './dtos/query-item.dto';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item) private readonly itemRepo: Repository<Item>,
  ) {}

  async getAllItems(queryItemDto: QueryItemDto) {
    const query = await this.itemRepo
      .createQueryBuilder()
      .select('*')
      .where('approved = :approved', { approved: true });
    if (queryItemDto.nama) {
      query.andWhere('name LIKE :name', { name: `%${queryItemDto.nama}%` });
    }
    if (queryItemDto.category) {
      query.andWhere('category LIKE :category', {
        category: `%${queryItemDto.category}%`,
      });
    }
    if (queryItemDto.location) {
      query.andWhere('location LIKE :location', {
        location: `%${queryItemDto.location}%`,
      });
    }
    return query.getRawMany();
  }

  create(item: CreateItemDto, user: User) {
    const newItem = this.itemRepo.create(item);
    newItem.user = user;
    return this.itemRepo.save(newItem);
  }

  async approveItem(id: number, approved: boolean) {
    const item = await this.itemRepo.findOneBy({ id });
    if (!item) {
      throw new Error('Item not found');
    }
    item.approved = approved;
    return this.itemRepo.save(item);
  }
}
