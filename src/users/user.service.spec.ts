import { PrismaClient } from '@prisma/client';
import { UsersService } from './users.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const makeMockUser = (overrides = {}) => ({
  id: '1',
  name: 'Will',
  email: 'will@email.com',
  passwordHash: 'hash123',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('UserService', () => {
  let service: UsersService;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prisma = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('FindById', () => {
    test('should throw NotFoundException if the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.findById('not-exist')).rejects.toThrow(
        NotFoundException,
      );
    });

    test('Should return the user without the hashPassword', async () => {
      prisma.user.findUnique.mockResolvedValue(makeMockUser());

      const result = await service.findById('1');

      expect(result).not.toHaveProperty('PasswordHash');
      expect(result).toHaveProperty('id', '1');
    });
  });
});
