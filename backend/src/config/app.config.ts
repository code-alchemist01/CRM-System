import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
  uploadDest: process.env.UPLOAD_DEST || './uploads',
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10), // 60 seconds
    limit: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // 100 requests per TTL
  },
}));
