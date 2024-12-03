import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';
import { UpdateClassDto } from './dtos/update-user.dto';
import { SerializeInterceptor } from 'src/interceptors/serialize.interceptors';
import { UserDto } from './dtos/user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseInterceptors(new SerializeInterceptor(UserDto))
  @Get('/')
  findAllUsers(@Query('email') email: string) {
    return this.usersService.find(email);
  }

  @Post('/')
  createUser(@Body() body: CreateUserDto) {
    return this.usersService.create(body.name, body.email, body.password);
  }

  @UseInterceptors(new SerializeInterceptor(UserDto))
  @Get('/:id')
  findUser(@Param('id') id: string) {
    return this.usersService.findOneBy(+id);
  }

  @Patch('/:id')
  updateUser(@Param('id') id: string, @Body() body: UpdateClassDto) {
    return this.usersService.update(+id, body);
  }

  @Delete('/:id')
  removeUser(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
