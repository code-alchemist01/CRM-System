import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTemplate } from './entities/email-template.entity';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';

@Injectable()
export class EmailTemplatesService {
  constructor(
    @InjectRepository(EmailTemplate)
    private emailTemplateRepository: Repository<EmailTemplate>,
  ) {}

  async create(
    createEmailTemplateDto: CreateEmailTemplateDto,
    tenantId: string,
  ): Promise<EmailTemplate> {
    const template = this.emailTemplateRepository.create({
      ...createEmailTemplateDto,
      tenantId,
    });
    return this.emailTemplateRepository.save(template);
  }

  async findAll(tenantId: string): Promise<EmailTemplate[]> {
    return this.emailTemplateRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<EmailTemplate> {
    const template = await this.emailTemplateRepository.findOne({
      where: { id, tenantId },
    });
    if (!template) {
      throw new NotFoundException(`Email template with ID ${id} not found`);
    }
    return template;
  }

  async update(
    id: string,
    updateEmailTemplateDto: UpdateEmailTemplateDto,
    tenantId: string,
  ): Promise<EmailTemplate> {
    const template = await this.findOne(id, tenantId);
    Object.assign(template, updateEmailTemplateDto);
    return this.emailTemplateRepository.save(template);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const template = await this.findOne(id, tenantId);
    await this.emailTemplateRepository.remove(template);
  }
}

