import { IsUUID, IsOptional, IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOpportunityStageDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  stageId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  order?: number;
}

export class MoveOpportunityStageDto {
  @ApiProperty()
  @IsUUID()
  stageId: string;
}

