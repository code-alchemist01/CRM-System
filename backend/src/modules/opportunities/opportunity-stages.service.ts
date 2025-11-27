import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OpportunityStage } from './entities/opportunity-stage.entity';
import { CreateOpportunityStageDto } from './dto/create-opportunity-stage.dto';
import { UpdateOpportunityStageDto } from './dto/update-opportunity-stage.dto';

@Injectable()
export class OpportunityStagesService {
  constructor(
    @InjectRepository(OpportunityStage)
    private stageRepository: Repository<OpportunityStage>,
  ) {}

  async create(
    createStageDto: CreateOpportunityStageDto,
    tenantId: string,
  ): Promise<OpportunityStage> {
    const stage = this.stageRepository.create({
      ...createStageDto,
      tenantId,
    });
    return this.stageRepository.save(stage);
  }

  async findAll(tenantId: string): Promise<OpportunityStage[]> {
    return this.stageRepository.find({
      where: { tenantId },
      order: { order: 'ASC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<OpportunityStage> {
    const stage = await this.stageRepository.findOne({
      where: { id, tenantId },
    });
    if (!stage) {
      throw new NotFoundException(`Stage with ID ${id} not found`);
    }
    return stage;
  }

  async update(
    id: string,
    updateStageDto: UpdateOpportunityStageDto,
    tenantId: string,
  ): Promise<OpportunityStage> {
    const stage = await this.findOne(id, tenantId);
    Object.assign(stage, updateStageDto);
    return this.stageRepository.save(stage);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const stage = await this.findOne(id, tenantId);
    await this.stageRepository.remove(stage);
  }
}

