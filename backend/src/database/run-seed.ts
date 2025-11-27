import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { seedDatabase } from './seeds/initial-seed';

// Load environment variables
config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_DATABASE || 'CrmNew',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
  logging: true,
});

async function runSeed() {
  try {
    await dataSource.initialize();
    console.log('Database connection established');
    
    await seedDatabase(dataSource);
    
    await dataSource.destroy();
    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

runSeed();

