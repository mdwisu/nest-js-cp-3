import { Test, TestingModule } from '@nestjs/testing';
import { CurrentUserInterceptor } from './interceptors/current-user.interceptor';
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../users/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let fakeUserService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeAuthService = {
      login: (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password } as User),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUserService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
        CurrentUserInterceptor,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const user = {
        name: 'John Doe',
        email: 'john@example',
        password: 'password',
      };
      fakeUserService.create = jest.fn().mockResolvedValue(user);
      expect(await controller.register(user, {})).toBe(user);
    });
    describe('login', () => {
      it('should return a user login', async () => {
        const session = {
          userId: -10,
        };
        const user = await controller.login(
          { email: 'john@example', password: 'password' },
          session,
        );
        expect(user).toEqual({
          id: 1,
          email: 'john@example',
          password: 'password',
        });
        expect(session.userId).toEqual(1);
      });
    });
  });
});
