import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/login (POST) - should login successfully', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'admin123',
      })
      .expect(201)
      .expect((res) => {
        const body = res.body.data || res.body;
        expect(body).toBeDefined();
        expect(body.user || body).toBeDefined();
        expect(body.token).toBeDefined();
        const user = body.user || body;
        expect(user.email).toBe('admin@example.com');
      });
  });

  it('/auth/login (POST) - should fail with wrong credentials', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'wrongpassword',
      })
      .expect(401);
  });

  it('/auth/profile (GET) - should get profile with valid token', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'admin123',
      });

    const body = loginResponse.body.data || loginResponse.body;
    const token = body.token;

    return request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBe('admin@example.com');
      });
  });
});

