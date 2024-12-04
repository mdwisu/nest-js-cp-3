import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

describe('AuthService', () => {
  let service: AuthService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let usersService: UsersService;

  const fakeUsersService = {
    find: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: fakeUsersService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw BadRequestException if email already exists', async () => {
      fakeUsersService.find.mockResolvedValue([{ email: 'test@example.com' }]);

      await expect(
        service.register('John Doe', 'test@example.com', 'password'),
      ).rejects.toThrow(new BadRequestException('Email sudah terdaftar'));
    });

    it('should register a new user successfully', async () => {
      fakeUsersService.find.mockResolvedValue([]); // Ensure no user is found with the same email

      // Mock password generation with a proper salt and hash structure
      const mockSalt = 'de87fd08b9d3f74c'; // Example salt (16 hex characters, 8 bytes)
      const mockHash =
        'edbec6899209b9f30c9c5e4b9712e21e08c2f19d7fbfe18c386448aac4a1fe0b6d83fd06fab1e49e12c08d6e9e3065c106dfcf3479cbafc2095c0bacf2b64ae9'; // Example 64-byte hash (128 hex characters)
      const mockHashedPassword = `${mockSalt}.${mockHash}`; // Combining salt and hash

      // Mock the create method to return a user with the correct hashed password format
      fakeUsersService.create.mockResolvedValue({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: mockHashedPassword,
      });

      const user = await service.register(
        'John Doe',
        'john@example.com',
        'password',
      );
      expect(user).toEqual({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: mockHashedPassword,
      });

      // Now check that the password passed to create has the expected format
      const passwordParts = user.password.split('.');
      expect(passwordParts).toHaveLength(2); // The password should have a salt and hash part

      // Check that the salt part matches the expected pattern
      expect(passwordParts[0]).toMatch(/[a-f0-9]{16}/); // Salt should be a 16-character hex string

      // Check that the hash part matches the expected pattern
      expect(passwordParts[1]).toMatch(/[a-f0-9]{128}/); // Hash should be a 128-character hex string (64 bytes)
    });

    it('should fail to create a user with existing email', async () => {
      fakeUsersService.find.mockResolvedValue([{ email: 'test@example.com' }]);

      await expect(
        service.register('John Doe', 'test@example.com', 'password'),
      ).rejects.toThrow(new BadRequestException('Email sudah terdaftar'));
    });
    describe('login', () => {
      it('throws id user login with invalid email', async () => {
        fakeUsersService.find.mockResolvedValue([]);
        await expect(
          service.login('test@example.com', 'password'),
        ).rejects.toThrow(new NotFoundException('User tidak ditemukan'));
      });
      it('should throw BadRequestException if password is incorrect', async () => {
        // Mock user data to simulate a user with a stored password
        const mockUser = {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          password: 'hashedPassword123', // Example hashed password
        };

        fakeUsersService.find.mockResolvedValue([mockUser]);

        // Attempt login with the correct email but an incorrect password
        await expect(
          service.login('john@example.com', 'wrongPassword'),
        ).rejects.toThrow(new BadRequestException('Password salah'));
      });

      it('should login successfully', async () => {
        // Mock user data to simulate a user with a stored password
        const salt = 'de87fd0892f9df7b'; // Example salt
        const plainPassword = 'hashedPassword123';

        // Simulate the hash process in your application (using scrypt)
        const hash = (await scryptAsync(plainPassword, salt, 64)) as Buffer;
        const hashedPassword = `${salt}.${hash.toString('hex')}`;

        const mockUser = {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          password: hashedPassword, // Example hashed password
        };

        fakeUsersService.find.mockResolvedValue([mockUser]);

        // Attempt login with the correct email and password
        const result = await service.login(
          'john@example.com',
          'hashedPassword123',
        );
        expect(result).toEqual(mockUser);
      });
    });
  });
});
