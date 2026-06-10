import {
  Controller, Get, Post, Put, Body, Param, Query, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { HotelsService } from './hotels.service';
import { CreateHotelDto, UpdateHotelDto } from './dto/hotel.dto';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('hotels')
@ApiBearerAuth()
@Controller('hotels')
export class HotelsController {
  constructor(private hotelsService: HotelsService) {}

  @Post()
  @Roles('super_admin', 'hotel_owner')
  @ApiOperation({ summary: 'Register a new hotel' })
  create(@Body() dto: CreateHotelDto, @CurrentUser() user: AuthUser) {
    return this.hotelsService.create(dto, user.tenantId, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List hotels' })
  findAll(
    @CurrentUser() user: AuthUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.hotelsService.findAll(user.tenantId, page, limit);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.hotelsService.findOne(id);
  }

  @Put(':id')
  @Roles('super_admin', 'hotel_owner', 'hotel_manager')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHotelDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.hotelsService.update(id, dto, user.id);
  }

  @Post(':id/heartbeat')
  heartbeat(@Param('id', ParseUUIDPipe) id: string) {
    return this.hotelsService.heartbeat(id);
  }
}
