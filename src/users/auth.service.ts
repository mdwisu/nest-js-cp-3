import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async register(name: string, email: string, password: string) {
    // check apakaah ada user yang menggunakan email sama
    const users = await this.usersService.find(email);
    if (users.length) {
      throw new BadRequestException('Email sudah terdaftar');
    }
    // hash
    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 64)) as Buffer;
    const result = salt + '.' + hash.toString('hex');
    // create user
  }
}
