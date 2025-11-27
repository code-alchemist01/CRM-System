import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../invoices/entities/payment.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
  ) {}

  async create(
    createPaymentDto: CreatePaymentDto,
    tenantId: string,
  ): Promise<Payment> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: createPaymentDto.invoiceId, tenantId },
      relations: ['payments'],
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${createPaymentDto.invoiceId} not found`);
    }

    // Calculate total payments - fetch separately if not loaded
    let existingPayments = invoice.payments || [];
    if (!existingPayments || existingPayments.length === 0) {
      existingPayments = await this.paymentRepository.find({
        where: { invoiceId: createPaymentDto.invoiceId, tenantId },
      });
    }
    const totalPaid = existingPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const newTotal = totalPaid + Number(createPaymentDto.amount);

    if (newTotal > Number(invoice.total)) {
      throw new BadRequestException('Payment amount exceeds invoice total');
    }

    const payment = this.paymentRepository.create({
      invoiceId: createPaymentDto.invoiceId,
      amount: Number(createPaymentDto.amount),
      paymentMethod: createPaymentDto.paymentMethod,
      paymentDate: createPaymentDto.paymentDate ? new Date(createPaymentDto.paymentDate) : new Date(),
      notes: createPaymentDto.notes,
      tenantId,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // Update invoice status if fully paid
    if (newTotal >= Number(invoice.total)) {
      invoice.status = 'paid' as any;
      invoice.paidDate = new Date();
    }

    await this.invoiceRepository.save(invoice);

    return savedPayment;
  }

  async findAll(tenantId: string, invoiceId?: string): Promise<Payment[]> {
    const where: any = { tenantId };
    if (invoiceId) {
      where.invoiceId = invoiceId;
    }
    return this.paymentRepository.find({
      where,
      relations: ['invoice'],
      order: { paymentDate: 'DESC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id, tenantId },
      relations: ['invoice'],
    });
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async update(
    id: string,
    updatePaymentDto: UpdatePaymentDto,
    tenantId: string,
  ): Promise<Payment> {
    const payment = await this.findOne(id, tenantId);
    Object.assign(payment, {
      ...updatePaymentDto,
      paymentDate: updatePaymentDto.paymentDate ? new Date(updatePaymentDto.paymentDate) : payment.paymentDate,
    });
    return this.paymentRepository.save(payment);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const payment = await this.findOne(id, tenantId);
    await this.paymentRepository.remove(payment);
  }
}

