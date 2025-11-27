import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
  ) {}

  async create(file: Express.Multer.File, userId: string, tenantId: string, data: any): Promise<Document> {
    const document = this.documentRepository.create({
      fileName: file.filename,
      originalFileName: file.originalname,
      filePath: file.path,
      mimeType: file.mimetype,
      fileSize: file.size,
      uploadedById: userId,
      tenantId,
      ...data,
    });
    const saved = await this.documentRepository.save(document);
    return Array.isArray(saved) ? saved[0] : (saved as unknown as Document);
  }

  async findAll(tenantId: string): Promise<Document[]> {
    return this.documentRepository.find({
      where: { tenantId },
      relations: ['uploadedBy', 'customer', 'opportunity'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { id, tenantId },
      relations: ['uploadedBy', 'customer', 'opportunity'],
    });
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    return document;
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const document = await this.findOne(id, tenantId);
    await this.documentRepository.remove(document);
  }
}

