import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../invoices/entities/payment.entity';
import { Invoice, InvoiceStatus } from '../invoices/entities/invoice.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

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
    this.logger.log(`Creating payment for invoice ${createPaymentDto.invoiceId}, tenant ${tenantId}`);
    
    try {
      // Validate amount - convert to number (handles both number and string from JSON)
      const amountValue = typeof createPaymentDto.amount === 'number' 
        ? createPaymentDto.amount 
        : parseFloat(String(createPaymentDto.amount).replace(/,/g, ''));
      
      if (!amountValue || isNaN(amountValue) || amountValue <= 0) {
        throw new BadRequestException(`Payment amount must be greater than 0. Received: ${createPaymentDto.amount}`);
      }

      // Validate invoiceId
      if (!createPaymentDto.invoiceId) {
        throw new BadRequestException('Invoice ID is required');
      }

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
      
      // Convert decimal values to numbers for comparison
      const invoiceTotal = parseFloat(String(invoice.total || 0));
      const totalPaid = existingPayments.reduce((sum, p) => {
        const amount = parseFloat(String(p.amount || 0));
        return sum + amount;
      }, 0);
      
      // Use the already validated amountValue
      const paymentAmount = amountValue;
      
      const newTotal = totalPaid + paymentAmount;
      
      this.logger.debug(`Invoice total: ${invoiceTotal}, Already paid: ${totalPaid}, Payment amount: ${paymentAmount}, New total: ${newTotal}`);

      if (newTotal > invoiceTotal) {
        throw new BadRequestException(
          `Payment amount exceeds invoice total. Invoice total: ${invoiceTotal}, Already paid: ${totalPaid}, Attempting to pay: ${paymentAmount}`,
        );
      }

      // Ensure paymentDate is valid
      let paymentDate: Date;
      if (createPaymentDto.paymentDate) {
        paymentDate = new Date(createPaymentDto.paymentDate);
        if (isNaN(paymentDate.getTime())) {
          throw new BadRequestException(`Invalid payment date: ${createPaymentDto.paymentDate}`);
        }
      } else {
        paymentDate = new Date();
      }

      const payment = this.paymentRepository.create({
        invoiceId: createPaymentDto.invoiceId,
        amount: paymentAmount,
        paymentMethod: createPaymentDto.paymentMethod || null,
        paymentDate: paymentDate,
        notes: createPaymentDto.notes || null,
        tenantId,
      } as Partial<Payment>);


      const savedPayment = await this.paymentRepository.save(payment);
      this.logger.log(`Payment created successfully with ID: ${savedPayment.id}`);

      // Update invoice status if fully paid (with small tolerance for floating point comparison)
      // Wrap in try-catch so payment creation doesn't fail if invoice update fails
      try {
        const tolerance = 0.01;
        if (newTotal >= invoiceTotal - tolerance) {
          invoice.status = InvoiceStatus.PAID;
          invoice.paidDate = new Date();
          await this.invoiceRepository.save(invoice);
          this.logger.log(`Invoice ${invoice.id} status updated to PAID`);
        }
      } catch (invoiceUpdateError) {
        // Log error but don't fail payment creation
        this.logger.error(
          `Failed to update invoice status for invoice ${invoice.id}:`,
          invoiceUpdateError instanceof Error ? invoiceUpdateError.message : invoiceUpdateError,
        );
        // Payment was created successfully, so we still return it
      }

      // Reload payment with relations for response
      // Use select to avoid circular references
      try {
        const paymentWithRelations = await this.paymentRepository.findOne({
          where: { id: savedPayment.id, tenantId },
          relations: ['invoice'],
        });

        if (paymentWithRelations && paymentWithRelations.invoice) {
          // Clean up circular references - return payment with minimal invoice data
          return {
            ...paymentWithRelations,
            invoice: {
              id: paymentWithRelations.invoice.id,
              invoiceNumber: paymentWithRelations.invoice.invoiceNumber,
              total: paymentWithRelations.invoice.total,
              status: paymentWithRelations.invoice.status,
            } as Partial<Invoice>,
          } as Payment;
        }
      } catch (reloadError) {
        this.logger.warn(`Failed to reload payment with relations: ${reloadError instanceof Error ? reloadError.message : reloadError}`);
      }

      return savedPayment;
    } catch (error) {
      // Re-throw known exceptions
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        this.logger.error(`Payment creation failed: ${error.message}`);
        throw error;
      }
      // Log and re-throw unknown errors
      this.logger.error('Payment creation error:', error);
      this.logger.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      throw new BadRequestException(
        `Failed to create payment: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
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

