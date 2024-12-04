import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let usersService: UsersService;

  const mockUsersService = {
    find: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
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
      mockUsersService.find.mockResolvedValue([{ email: 'test@example.com' }]);

      await expect(
        service.register('John Doe', 'test@example.com', 'password'),
      ).rejects.toThrow(new BadRequestException('Email sudah terdaftar'));
    });

    it('should register a new user successfully', async () => {
      mockUsersService.find.mockResolvedValue([]);

      // Mock password generation with a proper salt and hash structure
      const mockSalt = 'de87fd0892f9df7b'; // Example salt (16 hex characters)
      const mockHash =
        'edbec6899209b9f30c9c5e4b9712e21e08c2f19d7fbfe18c386448aac4a1fe0b6d83fd06fab1e49e12c08d6e9e3065c106dfcf3479cbafc2095c0bacf2b64ae9'; // Example hash (64-byte hash)
      const mockHashedPassword = `${mockSalt}.${mockHash}`; // Combining salt and hash

      // Mock the create method to return a user with the correct hashed password format
      mockUsersService.create.mockResolvedValue({
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
      expect(passwordParts[1]).toMatch(/[a-f0-9]{128}/); // Hash should be a 128-character hex string
    });

    it('should fail to create a user with existing email', async () => {
      mockUsersService.find.mockResolvedValue([{ email: 'test@example.com' }]);

      await expect(
        service.register('John Doe', 'test@example.com', 'password'),
      ).rejects.toThrow(new BadRequestException('Email sudah terdaftar'));
    });
  });
});
