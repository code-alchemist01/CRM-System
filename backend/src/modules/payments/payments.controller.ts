import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create payment' })
  async create(@Body() createPaymentDto: CreatePaymentDto, @Request() req) {
    try {
      return await this.paymentsService.create(createPaymentDto, req.user.tenantId);
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all payments' })
  findAll(@Request() req, @Query('invoiceId') invoiceId?: string) {
    return this.paymentsService.findAll(req.user.tenantId, invoiceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.paymentsService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update payment' })
  update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
    @Request() req,
  ) {
    return this.paymentsService.update(id, updatePaymentDto, req.user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete payment' })
  remove(@Param('id') id: string, @Request() req) {
    return this.paymentsService.remove(id, req.user.tenantId);
  }
}

