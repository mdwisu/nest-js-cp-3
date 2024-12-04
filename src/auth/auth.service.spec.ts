import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const fakeUsersService: Partial<UsersService> = {
      find: () => Promise.resolve([]),
      create: (name: string, email: string, password: string) =>
        Promise.resolve({
          id: 1,
          name,
          email,
          password,
        } as User),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: fakeUsersService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user with a salted and hashed password', async () => {
    const user = await service.register(
      'test',
      'p8Y3A@example.com',
      'password',
    );

    expect(user.name).toEqual('test');
    expect(user.email).toEqual('p8Y3A@example.com');
    expect(user.password).not.toEqual('password');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });
});
