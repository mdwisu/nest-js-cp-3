import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
// import { setupApp } from '../src/setup-app';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // setupApp(app);
    await app.init();
  });

  it('handles register', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'John Doe',
        email: 'john1@example.com',
        password: 'password',
      })
      .expect(201)
      .then(({ body }: request.Response) => {
        expect(body.id).toBeDefined();
        expect(body.name).toBe('John Doe');
        expect(body.email).toBe('john1@example.com');
      });
  });

  it('logged in after registration', async () => {
    const email = 'john1@example.com';

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'John Doe',
        email,
        password: 'password',
      })
      .expect(201);

    const cookie = res.get('Set-Cookie');
    const { body } = await request(app.getHttpServer())
      .get('/auth/whoami')
      .set('Cookie', cookie)
      .expect(200);

    expect(body.email).toBe(email);
  });
});
