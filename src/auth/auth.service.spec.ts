import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

describe('AuthService', () => {
  let service: AuthService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let usersService: UsersService;

  const mockUser = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashedPassword123', // Example hashed password
  };

  const fakeUsersService = {
    find: jest.fn(),
    create: jest.fn().mockResolvedValue(mockUser),
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
      fakeUsersService.find.mockResolvedValue([mockUser]);

      await expect(
        service.register('John Doe', 'test@example.com', 'password'),
      ).rejects.toThrow(new BadRequestException('Email sudah terdaftar'));
    });

    it('should register a new user successfully', async () => {
      fakeUsersService.find.mockResolvedValue([]); // Ensure no user is found with the same email

      const plainPassword = 'password';
      const salt = 'de87fd08b9d3f74c'; // Example salt (16 hex characters)
      const hash = (await scryptAsync(plainPassword, salt, 64)) as Buffer;
      const hashedPassword = `${salt}.${hash.toString('hex')}`;

      // Mock the create method to return a user with the correct hashed password format
      fakeUsersService.create.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });

      const user = await service.register(
        'John Doe',
        'john@example.com',
        plainPassword,
      );
      expect(user).toEqual({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
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
      fakeUsersService.find.mockResolvedValue([mockUser]);

      await expect(
        service.register('John Doe', 'john@example.com', 'password'),
      ).rejects.toThrow(new BadRequestException('Email sudah terdaftar'));
    });
  });
  describe('login', () => {
    it('throws id user login with invalid email', async () => {
      fakeUsersService.find.mockResolvedValue([]);
      await expect(
        service.login('nonexistent@example.com', 'password'),
      ).rejects.toThrow(new NotFoundException('User tidak ditemukan'));
    });
    it('should throw BadRequestException if password is incorrect', async () => {
      // Mock user data to simulate a user with a stored password
      fakeUsersService.find.mockResolvedValue([mockUser]);
      // Attempt login with the correct email but an incorrect password
      await expect(
        service.login('john@example.com', 'wrongPassword'),
      ).rejects.toThrow(new BadRequestException('Password salah'));
    });

    it('should login successfully', async () => {
      const plainPassword = 'password';
      const salt = 'de87fd08b9d3f74c'; // Example salt
      const hash = (await scryptAsync(plainPassword, salt, 64)) as Buffer;
      const hashedPassword = `${salt}.${hash.toString('hex')}`;
      console.log(hashedPassword);
      // Ensure no users with the same email exist before registration
      fakeUsersService.find.mockResolvedValue([]); // Simulate no users found for the email

      // Mock user creation to return a valid user object with the hashed password
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
      };

      fakeUsersService.create.mockResolvedValue(mockUser);

      // Register the user with the hashed password
      const user = await service.register(
        'John Doe',
        'john@example.com',
        plainPassword,
      );

      // Ensure the user registration worked
      expect(user).toEqual(mockUser);

      // Now, mock the find method to return the user when logging in
      fakeUsersService.find.mockResolvedValue([mockUser]);

      // Attempt login with the correct email and password
      const result = await service.login('john@example.com', plainPassword);

      // Check that the result matches the registered user
      expect(result).toEqual(mockUser);
    });
  });
});
