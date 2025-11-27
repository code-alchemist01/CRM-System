import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Customers (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login to get token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'admin123',
      });

    const body = loginResponse.body.data || loginResponse.body;
    authToken = body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/customers (POST) - should create a customer', () => {
    return request(app.getHttpServer())
      .post('/customers')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Customer',
        email: 'customer@test.com',
        phone: '1234567890',
      })
      .expect(201)
      .expect((res) => {
        const body = res.body.data || res.body;
        expect(body).toBeDefined();
        expect(body.name).toBe('Test Customer');
      });
  });

  it('/customers (GET) - should get all customers', () => {
    return request(app.getHttpServer())
      .get('/customers')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        const body = res.body.data || res.body;
        expect(Array.isArray(body)).toBe(true);
      });
  });

  it('/customers (GET) - should fail without token', () => {
    return request(app.getHttpServer())
      .get('/customers')
      .expect(401);
  });
});

