import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailsController } from './emails.controller';
import { EmailsService } from './emails.service';
import { Email } from './entities/email.entity';
import { EmailThread } from './entities/email-thread.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Email, EmailThread])],
  controllers: [EmailsController],
  providers: [EmailsService],
  exports: [EmailsService],
})
export class EmailsModule {}

