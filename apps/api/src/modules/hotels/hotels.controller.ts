import {
  Controller, Get, Post, Put, Body, Param, Query, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { HotelsService } from './hotels.service';
import { CreateHotelDto, UpdateHotelDto, RegisterHotelDto, RejectHotelDto } from './dto/hotel.dto';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('hotels')
@Controller('hotels')
export class HotelsController {
  constructor(private hotelsService: HotelsService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Public hotel self-registration (pending approval)' })
  register(@Body() dto: RegisterHotelDto) {
    return this.hotelsService.register(dto);
  }

  @Post()
  @ApiBearerAuth()
  @Roles('super_admin', 'hotel_owner')
  @ApiOperation({ summary: 'Register a new hotel (admin/owner)' })
  create(@Body() dto: CreateHotelDto, @CurrentUser() user: AuthUser) {
    return this.hotelsService.create(dto, user.tenantId, user.id);
  }

  @Get('pending')
  @ApiBearerAuth()
  @Roles('super_admin', 'police_command')
  @ApiOperation({ summary: 'List pending hotel registrations' })
  findPending(
    @CurrentUser() user: AuthUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.hotelsService.findPending(user.tenantId, page, limit);
  }

  @Get('admin/all')
  @ApiBearerAuth()
  @Roles('super_admin', 'police_command')
  @ApiOperation({ summary: 'List all hotels for admin panel' })
  findAllAdmin(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.hotelsService.findAllAdmin(page, limit);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List approved hotels' })
  findAll(
    @CurrentUser() user: AuthUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.hotelsService.findAll(user.tenantId, page, limit);
  }

  @Get(':id')
  @ApiBearerAuth()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.hotelsService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @Roles('super_admin', 'hotel_owner', 'hotel_manager', 'police_command')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHotelDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.hotelsService.update(id, dto, user.id);
  }

  @Post(':id/approve')
  @ApiBearerAuth()
  @Roles('super_admin', 'police_command')
  @ApiOperation({ summary: 'Approve pending hotel registration' })
  approve(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return this.hotelsService.approve(id, user.id);
  }

  @Post(':id/reject')
  @ApiBearerAuth()
  @Roles('super_admin', 'police_command')
  @ApiOperation({ summary: 'Reject pending hotel registration' })
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectHotelDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.hotelsService.reject(id, user.id, dto.reason);
  }

  @Post(':id/heartbeat')
  @ApiBearerAuth()
  heartbeat(@Param('id', ParseUUIDPipe) id: string) {
    return this.hotelsService.heartbeat(id);
  }
}
