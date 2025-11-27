import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OpportunitiesService } from './opportunities.service';
import { OpportunityStagesService } from './opportunity-stages.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { CreateOpportunityStageDto } from './dto/create-opportunity-stage.dto';
import { UpdateOpportunityStageDto, MoveOpportunityStageDto } from './dto/update-opportunity-stage.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('opportunities')
@Controller('opportunities')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OpportunitiesController {
  constructor(
    private readonly opportunitiesService: OpportunitiesService,
    private readonly stagesService: OpportunityStagesService,
  ) {}

  @Post()
  create(@Body() createOpportunityDto: CreateOpportunityDto, @Request() req) {
    return this.opportunitiesService.create(
      createOpportunityDto,
      req.user.tenantId,
    );
  }

  @Get()
  findAll(@Request() req) {
    return this.opportunitiesService.findAll(req.user.tenantId);
  }

  @Get('stages/:stageId')
  findByStage(@Param('stageId') stageId: string, @Request() req) {
    return this.opportunitiesService.findByStage(stageId, req.user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.opportunitiesService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOpportunityDto: UpdateOpportunityDto,
    @Request() req,
  ) {
    return this.opportunitiesService.update(
      id,
      updateOpportunityDto,
      req.user.tenantId,
    );
  }

  @Patch(':id/stage')
  updateStage(
    @Param('id') id: string,
    @Body() updateStageDto: MoveOpportunityStageDto,
    @Request() req,
  ) {
    return this.opportunitiesService.updateStage(
      id,
      updateStageDto,
      req.user.tenantId,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.opportunitiesService.remove(id, req.user.tenantId);
  }
}

@ApiTags('opportunity-stages')
@Controller('opportunity-stages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OpportunityStagesController {
  constructor(private readonly stagesService: OpportunityStagesService) {}

  @Post()
  create(@Body() createStageDto: CreateOpportunityStageDto, @Request() req) {
    return this.stagesService.create(createStageDto, req.user.tenantId);
  }

  @Get()
  findAll(@Request() req) {
    return this.stagesService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.stagesService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStageDto: UpdateOpportunityStageDto,
    @Request() req,
  ) {
    return this.stagesService.update(id, updateStageDto, req.user.tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.stagesService.remove(id, req.user.tenantId);
  }
}

