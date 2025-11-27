import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { EmailsService } from './emails.service';
import { CreateEmailDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('emails')
@Controller('emails')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EmailsController {
  constructor(private readonly emailsService: EmailsService) {}

  @Post()
  create(@Body() createEmailDto: CreateEmailDto, @Request() req) {
    return this.emailsService.create(
      createEmailDto,
      req.user.id,
      req.user.tenantId,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEmailDto: UpdateEmailDto,
    @Request() req,
  ) {
    return this.emailsService.update(id, updateEmailDto, req.user.tenantId);
  }

  @Patch(':id/send')
  send(@Param('id') id: string, @Request() req) {
    return this.emailsService.send(id, req.user.tenantId);
  }

  @Get()
  findAll(@Request() req) {
    return this.emailsService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.emailsService.findOne(id, req.user.tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.emailsService.remove(id, req.user.tenantId);
  }
}

