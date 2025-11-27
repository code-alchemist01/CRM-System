import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Email } from './entities/email.entity';
import { CreateEmailDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailsService {
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(Email)
    private emailRepository: Repository<Email>,
    private configService: ConfigService,
  ) {
    const emailConfig = this.configService.get('email');
    this.transporter = nodemailer.createTransport(emailConfig.smtp);
  }

  async create(createEmailDto: CreateEmailDto, userId: string, tenantId: string): Promise<Email> {
    const email = this.emailRepository.create({
      ...createEmailDto,
      sentById: userId,
      tenantId,
    });
    return this.emailRepository.save(email);
  }

  async update(
    id: string,
    updateEmailDto: UpdateEmailDto,
    tenantId: string,
  ): Promise<Email> {
    const email = await this.findOne(id, tenantId);
    Object.assign(email, updateEmailDto);
    return this.emailRepository.save(email);
  }

  async send(emailId: string, tenantId: string): Promise<void> {
    const email = await this.emailRepository.findOne({
      where: { id: emailId, tenantId },
    });
    if (!email) {
      throw new NotFoundException(`Email with ID ${emailId} not found`);
    }

    if (!email.to || email.to.length === 0) {
      throw new BadRequestException('Email must have at least one recipient');
    }

    try {
      const emailConfig = this.configService.get('email');
      if (!emailConfig?.smtp?.auth?.user) {
        throw new BadRequestException('Email configuration is missing. Please configure SMTP settings.');
      }

      await this.transporter.sendMail({
        from: emailConfig.smtp.auth.user,
        to: email.to,
        cc: email.cc,
        bcc: email.bcc,
        subject: email.subject,
        html: email.body,
      });

      email.status = 'sent' as any;
      email.sentAt = new Date();
      await this.emailRepository.save(email);
    } catch (error) {
      email.status = 'failed' as any;
      await this.emailRepository.save(email);
      
      // Provide user-friendly error messages
      let errorMessage = 'E-posta gönderilemedi.';
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        if (errorMsg.includes('invalid login') || errorMsg.includes('username and password not accepted') || errorMsg.includes('badcredentials')) {
          errorMessage = 'SMTP kimlik doğrulama hatası. Lütfen e-posta ayarlarınızı kontrol edin.';
        } else if (errorMsg.includes('connection') || errorMsg.includes('timeout')) {
          errorMessage = 'SMTP sunucusuna bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.';
        } else if (errorMsg.includes('authentication')) {
          errorMessage = 'SMTP kimlik doğrulama hatası. Kullanıcı adı ve şifrenizi kontrol edin.';
        } else {
          errorMessage = `E-posta gönderilemedi: ${error.message}`;
        }
      }
      
      throw new BadRequestException(errorMessage);
    }
  }

  async findAll(tenantId: string): Promise<Email[]> {
    return this.emailRepository.find({
      where: { tenantId },
      relations: ['sentBy', 'customer', 'opportunity', 'thread'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<Email> {
    const email = await this.emailRepository.findOne({
      where: { id, tenantId },
      relations: ['sentBy', 'customer', 'opportunity', 'thread'],
    });
    if (!email) {
      throw new NotFoundException(`Email with ID ${id} not found`);
    }
    return email;
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const email = await this.findOne(id, tenantId);
    await this.emailRepository.remove(email);
  }
}

