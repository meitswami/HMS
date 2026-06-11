import { Controller, Get, Post, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DataRequestsService } from './data-requests.service';
import { CreateDataRequestDto, ReviewDataRequestDto } from './dto/data-request.dto';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('data-requests')
@ApiBearerAuth()
@Controller('data-requests')
export class DataRequestsController {
  constructor(private dataRequestsService: DataRequestsService) {}

  @Post()
  @Roles('police_officer', 'police_command', 'super_admin')
  @ApiOperation({ summary: 'Request access to hotel guest data for date/time range' })
  create(@Body() dto: CreateDataRequestDto, @CurrentUser() user: AuthUser) {
    return this.dataRequestsService.create(dto, user.id, user.tenantId);
  }

  @Get()
  @Roles('super_admin', 'police_command')
  @ApiOperation({ summary: 'List all data access requests (admin review)' })
  findAll(
    @CurrentUser() user: AuthUser,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.dataRequestsService.findAll(user.tenantId, status, page, limit);
  }

  @Get('my')
  @Roles('police_officer', 'police_command', 'super_admin')
  @ApiOperation({ summary: 'List my data access requests' })
  findMy(@CurrentUser() user: AuthUser, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.dataRequestsService.findMyRequests(user.id, page, limit);
  }

  @Post(':id/approve')
  @Roles('super_admin', 'police_command')
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewDataRequestDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.dataRequestsService.approve(id, user.id, dto.reviewNotes);
  }

  @Post(':id/reject')
  @Roles('super_admin', 'police_command')
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewDataRequestDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.dataRequestsService.reject(id, user.id, dto.reviewNotes);
  }

  @Get(':id/data')
  @Roles('police_officer', 'police_command', 'super_admin')
  @ApiOperation({ summary: 'Fetch guest data for an approved request only' })
  getData(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return this.dataRequestsService.getApprovedGuestData(id, user.id, user.role);
  }
}
