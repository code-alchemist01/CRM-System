import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpportunitiesController, OpportunityStagesController } from './opportunities.controller';
import { OpportunitiesService } from './opportunities.service';
import { OpportunityStagesService } from './opportunity-stages.service';
import { Opportunity } from './entities/opportunity.entity';
import { OpportunityStage } from './entities/opportunity-stage.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Opportunity, OpportunityStage])],
  controllers: [OpportunitiesController, OpportunityStagesController],
  providers: [OpportunitiesService, OpportunityStagesService],
  exports: [OpportunitiesService, OpportunityStagesService],
})
export class OpportunitiesModule {}

