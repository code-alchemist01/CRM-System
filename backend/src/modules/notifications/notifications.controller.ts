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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto, @Request() req) {
    return this.notificationsService.create(
      createNotificationDto,
      req.user.tenantId,
    );
  }

  @Get()
  findAll(@Request() req) {
    return this.notificationsService.findAll(
      req.user.id,
      req.user.tenantId,
    );
  }

  @Get('unread')
  findUnread(@Request() req) {
    return this.notificationsService.findUnread(
      req.user.id,
      req.user.tenantId,
    );
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @Request() req) {
    return this.notificationsService.markAsRead(
      id,
      req.user.id,
      req.user.tenantId,
    );
  }

  @Patch('read-all')
  markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(
      req.user.id,
      req.user.tenantId,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.notificationsService.remove(
      id,
      req.user.id,
      req.user.tenantId,
    );
  }
}

