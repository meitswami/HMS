import {
  Controller, Get, Post, Put, Body, Param, Query, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { GuestsService } from './guests.service';
import { CreateGuestDto, CheckoutGuestDto, GuestQueryDto } from './dto/guest.dto';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('guests')
@ApiBearerAuth()
@Controller('guests')
export class GuestsController {
  constructor(private guestsService: GuestsService) {}

  @Post()
  @Roles('receptionist', 'hotel_manager', 'hotel_owner')
  @ApiOperation({ summary: 'Register a new guest (digital register entry)' })
  register(@Body() dto: CreateGuestDto, @CurrentUser() user: AuthUser) {
    return this.guestsService.register(dto, user.tenantId, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List guests with filters' })
  findAll(@Query() query: GuestQueryDto, @CurrentUser() user: AuthUser) {
    return this.guestsService.findAll(query, user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.guestsService.findOne(id);
  }

  @Post(':id/checkout')
  @Roles('receptionist', 'hotel_manager')
  checkout(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CheckoutGuestDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.guestsService.checkout(id, dto, user.id);
  }
}
