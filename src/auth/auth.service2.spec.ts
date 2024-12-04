import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let usersService: UsersService;
  let fakeUsersService: Partial<UsersService> = {};

  beforeEach(async () => {
    const users: User[] = [];

    fakeUsersService = {
      find: (email: string) => {
        const user = users.filter((user) => user.email === email);
        return Promise.resolve(user);
      },
      create: (name: string, email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          name,
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: fakeUsersService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should create a new user', async () => {
    const user = await service.register(
      'John Doe',
      'john@example.com',
      'password',
    );
    expect(user.name).toEqual('John Doe');
    expect(user.password).not.toEqual('password');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('should fail to create a user with an existing email', async () => {
    await service.register('John Doe', 'john@example.com', 'password');
    await expect(
      service.register('John Doe', 'john@example.com', 'password'),
    ).rejects.toThrow(new Error('Email sudah terdaftar'));
  });

  it('throw if user login with invalid email', async () => {
    await expect(
      service.login('invalid@example.com', 'password'),
    ).rejects.toThrow('User tidak ditemukan');
  });

  it('should fail if user login with invalid password', async () => {
    await service.register('John Doe', 'john@example.com', 'password');
    await expect(
      service.login('john@example.com', 'wrongPassword'),
    ).rejects.toThrow('Password salah');
  });

  it('should login  existing user', async () => {
    await service.register('John Doe', 'john@example.com', 'password');
    const user = await service.login('john@example.com', 'password');
    expect(user).toBeDefined();
  });
});
