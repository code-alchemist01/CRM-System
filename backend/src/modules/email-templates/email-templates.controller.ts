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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { EmailTemplatesService } from './email-templates.service';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('email-templates')
@Controller('email-templates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EmailTemplatesController {
  constructor(private readonly emailTemplatesService: EmailTemplatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create email template' })
  create(@Body() createEmailTemplateDto: CreateEmailTemplateDto, @Request() req) {
    return this.emailTemplatesService.create(createEmailTemplateDto, req.user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all email templates' })
  findAll(@Request() req) {
    return this.emailTemplatesService.findAll(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get email template by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.emailTemplatesService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update email template' })
  update(
    @Param('id') id: string,
    @Body() updateEmailTemplateDto: UpdateEmailTemplateDto,
    @Request() req,
  ) {
    return this.emailTemplatesService.update(id, updateEmailTemplateDto, req.user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete email template' })
  remove(@Param('id') id: string, @Request() req) {
    return this.emailTemplatesService.remove(id, req.user.tenantId);
  }
}

