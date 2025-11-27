import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Opportunity } from './entities/opportunity.entity';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { UpdateOpportunityStageDto } from './dto/update-opportunity-stage.dto';

@Injectable()
export class OpportunitiesService {
  constructor(
    @InjectRepository(Opportunity)
    private opportunityRepository: Repository<Opportunity>,
  ) {}

  async create(
    createOpportunityDto: CreateOpportunityDto,
    tenantId: string,
  ): Promise<Opportunity> {
    const opportunity = this.opportunityRepository.create({
      ...createOpportunityDto,
      tenantId,
    });
    return this.opportunityRepository.save(opportunity);
  }

  async findAll(tenantId: string, search?: string): Promise<Opportunity[]> {
    const queryBuilder = this.opportunityRepository
      .createQueryBuilder('opportunity')
      .leftJoinAndSelect('opportunity.stage', 'stage')
      .leftJoinAndSelect('opportunity.customer', 'customer')
      .leftJoinAndSelect('opportunity.assignedTo', 'assignedTo')
      .where('opportunity.tenantId = :tenantId', { tenantId });

    if (search && search.trim()) {
      queryBuilder.andWhere(
        '(opportunity.title ILIKE :search OR opportunity.description ILIKE :search)',
        { search: `%${search.trim()}%` },
      );
    }

    return queryBuilder.orderBy('opportunity.createdAt', 'DESC').getMany();
  }

  async findByStage(stageId: string, tenantId: string): Promise<Opportunity[]> {
    return this.opportunityRepository.find({
      where: { stageId, tenantId },
      relations: ['stage', 'customer', 'assignedTo'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<Opportunity> {
    const opportunity = await this.opportunityRepository.findOne({
      where: { id, tenantId },
      relations: ['stage', 'customer', 'assignedTo'],
    });
    if (!opportunity) {
      throw new NotFoundException(`Opportunity with ID ${id} not found`);
    }
    return opportunity;
  }

  async update(
    id: string,
    updateOpportunityDto: UpdateOpportunityDto,
    tenantId: string,
  ): Promise<Opportunity> {
    const opportunity = await this.findOne(id, tenantId);
    Object.assign(opportunity, updateOpportunityDto);
    return this.opportunityRepository.save(opportunity);
  }

  async updateStage(
    id: string,
    updateStageDto: { stageId: string },
    tenantId: string,
  ): Promise<Opportunity> {
    const opportunity = await this.findOne(id, tenantId);
    opportunity.stageId = updateStageDto.stageId;
    return this.opportunityRepository.save(opportunity);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const opportunity = await this.findOne(id, tenantId);
    await this.opportunityRepository.remove(opportunity);
  }
}

