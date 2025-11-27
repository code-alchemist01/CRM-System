import { IsString, IsOptional, IsUUID, IsArray, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EmailStatus } from '../entities/email.entity';

export class CreateEmailDto {
  @ApiProperty()
  @IsString()
  subject: string;

  @ApiProperty()
  @IsString()
  body: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  to: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cc?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bcc?: string[];

  @ApiProperty({ enum: EmailStatus, default: EmailStatus.DRAFT })
  @IsOptional()
  @IsEnum(EmailStatus)
  status?: EmailStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  threadId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  opportunityId?: string;
}

