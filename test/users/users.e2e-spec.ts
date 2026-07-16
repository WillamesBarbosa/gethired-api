import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  describe('POST api/users', () => {
    test('Should create users should create a user and not return the passwordHash', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'Will', email: 'will@email.com', password: '123456' })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', 'will@email.com');
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    test('Should return 409 if email already exist', async () => {
      await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'Will', email: 'will@email.com', password: '123456' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'Will', email: 'will@email.com', password: '123456' })
        .expect(409);
    });
  });
});
