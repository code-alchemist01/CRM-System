import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
  ) {}

  async create(
    createContactDto: CreateContactDto,
    tenantId: string,
  ): Promise<Contact> {
    const contact = this.contactRepository.create({
      ...createContactDto,
      tenantId,
    });
    return this.contactRepository.save(contact);
  }

  async findAll(tenantId: string): Promise<Contact[]> {
    return this.contactRepository.find({
      where: { tenantId },
      relations: ['customer'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<Contact> {
    const contact = await this.contactRepository.findOne({
      where: { id, tenantId },
      relations: ['customer'],
    });
    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }
    return contact;
  }

  async update(
    id: string,
    updateContactDto: UpdateContactDto,
    tenantId: string,
  ): Promise<Contact> {
    const contact = await this.findOne(id, tenantId);
    Object.assign(contact, updateContactDto);
    return this.contactRepository.save(contact);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const contact = await this.findOne(id, tenantId);
    await this.contactRepository.remove(contact);
  }
}

