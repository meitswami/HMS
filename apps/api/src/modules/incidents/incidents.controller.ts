import { Controller, Get, Put, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IncidentsService } from './incidents.service';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('incidents')
@ApiBearerAuth()
@Controller('incidents')
export class IncidentsController {
  constructor(private incidentsService: IncidentsService) {}

  @Get()
  @Roles('super_admin', 'police_command', 'police_officer', 'hotel_manager')
  @ApiOperation({ summary: 'List security incidents and alerts' })
  findAll(
    @Query('status') status?: string,
    @Query('severity') severity?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.incidentsService.findAll({ status, severity, page, limit });
  }

  @Put(':id/status')
  @Roles('super_admin', 'police_command', 'police_officer')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { status: string; notes?: string },
    @CurrentUser() user: AuthUser,
  ) {
    return this.incidentsService.updateStatus(id, body.status, user.id, body.notes);
  }
}
