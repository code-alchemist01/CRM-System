import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import PDFDocument = require('pdfkit');
import * as path from 'path';
import * as fs from 'fs';
import { Invoice } from './entities/invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto, tenantId: string): Promise<Invoice> {
    const invoice = this.invoiceRepository.create({
      ...createInvoiceDto,
      tenantId,
    });
    return this.invoiceRepository.save(invoice);
  }

  async findAll(tenantId: string, search?: string): Promise<Invoice[]> {
    const where: any = { tenantId };
    if (search && search.trim()) {
      where.invoiceNumber = Like(`%${search.trim()}%`);
    }
    return this.invoiceRepository.find({
      where,
      relations: ['customer', 'items', 'payments'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id, tenantId },
      relations: ['customer', 'items', 'payments'],
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    return invoice;
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto, tenantId: string): Promise<Invoice> {
    const invoice = await this.findOne(id, tenantId);
    Object.assign(invoice, updateInvoiceDto);
    return this.invoiceRepository.save(invoice);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const invoice = await this.findOne(id, tenantId);
    await this.invoiceRepository.remove(invoice);
  }

  async generatePDF(id: string, tenantId: string): Promise<Buffer> {
    const invoice = await this.findOne(id, tenantId);
    
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ 
        margin: 50,
        autoFirstPage: true,
      });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // UTF-8 desteği için TTF font yükleme
      // Türkçe karakterler için DejaVu Sans fontunu kullan
      let fontLoaded = false;
      try {
        // Önce backend/assets/fonts/ klasöründen dene
        let fontPath = path.join(process.cwd(), 'assets', 'fonts', 'DejaVuSans.ttf');
        if (!fs.existsSync(fontPath)) {
          // Eğer yoksa, src klasöründen dene (development)
          fontPath = path.join(process.cwd(), 'src', 'assets', 'fonts', 'DejaVuSans.ttf');
        }
        if (!fs.existsSync(fontPath)) {
          // Eğer hala yoksa, dist klasöründen dene (production)
          fontPath = path.join(process.cwd(), 'dist', 'assets', 'fonts', 'DejaVuSans.ttf');
        }
        
        if (fs.existsSync(fontPath)) {
          doc.registerFont('DejaVu', fontPath);
          doc.font('DejaVu');
          fontLoaded = true;
          console.log('DejaVu Sans font yüklendi:', fontPath);
        } else {
          console.warn('DejaVu Sans font dosyası bulunamadı. Türkçe karakterler bozuk görünebilir.');
          console.warn('Font dosyasını şuraya ekleyin: backend/assets/fonts/DejaVuSans.ttf');
          console.warn('İndirme: https://dejavu-fonts.github.io/');
        }
      } catch (error) {
        console.error('Font yükleme hatası:', error);
      }
      
      // Font yüklenmediyse, Unicode karakterlerini doğru encode et
      if (!fontLoaded) {
        // PDFKit varsayılan fontu kullan ama encoding'i doğru ayarla
        // Bu durumda Türkçe karakterler hala bozuk görünebilir
      }

      // Header
      doc.fontSize(20).text('FATURA', { align: 'center' });
      doc.moveDown();

      // Invoice Info
      let yPos = 100;
      doc.fontSize(12);
      doc.text(`Fatura No: ${invoice.invoiceNumber}`, 50, yPos);
      yPos += 20;
      doc.text(`Düzenleme Tarihi: ${invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString('tr-TR') : '-'}`, 50, yPos);
      yPos += 20;
      doc.text(`Vade Tarihi: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('tr-TR') : '-'}`, 50, yPos);
      yPos += 20;
      doc.text(`Durum: ${invoice.status}`, 50, yPos);
      yPos += 40;

      // Customer Info
      if (invoice.customer) {
        doc.text('Müşteri Bilgileri:', 50, yPos);
        yPos += 20;
        doc.text(`Ad: ${invoice.customer.name || '-'}`, 50, yPos);
        yPos += 20;
        if (invoice.customer.email) {
          doc.text(`E-posta: ${invoice.customer.email}`, 50, yPos);
          yPos += 20;
        }
        if (invoice.customer.phone) {
          doc.text(`Telefon: ${invoice.customer.phone}`, 50, yPos);
          yPos += 20;
        }
        yPos += 20;
      }

      // Items Table
      doc.text('Fatura Kalemleri:', 50, yPos);
      yPos += 20;

      // Table Header - UTF-8 için font belirtmeden kullan
      doc.fontSize(10);
      doc.text('Açıklama', 50, yPos);
      doc.text('Miktar', 300, yPos);
      doc.text('Birim Fiyat', 400, yPos);
      doc.text('Toplam', 500, yPos);
      yPos += 20;

      // Table Rows
      if (invoice.items && invoice.items.length > 0) {
        invoice.items.forEach((item) => {
          const itemTotal = Number(item.quantity) * Number(item.unitPrice);
          doc.text(item.description || '-', 50, yPos);
          doc.text(item.quantity.toString(), 300, yPos);
          doc.text(Number(item.unitPrice).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 400, yPos);
          doc.text(itemTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 500, yPos);
          yPos += 20;
        });
      } else {
        doc.text('Kalem bulunamadı', 50, yPos);
        yPos += 20;
      }

      // Totals
      yPos += 20;
      doc.fontSize(12);
      doc.text(`Ara Toplam: ${Number(invoice.subtotal).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`, 400, yPos);
      yPos += 20;
      doc.text(`KDV: ${Number(invoice.tax).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`, 400, yPos);
      yPos += 20;
      doc.fontSize(14);
      doc.text(`GENEL TOPLAM: ${Number(invoice.total).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`, 400, yPos);

      doc.end();
    });
  }
}

