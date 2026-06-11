import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('stats')
  @Roles('super_admin', 'police_command', 'police_officer')
  @ApiOperation({ summary: 'Police Command Centre live statistics' })
  getStats(@CurrentUser() user: AuthUser) {
    return this.dashboardService.getCommandCentreStats(user.tenantId);
  }

  @Get('districts')
  @Roles('super_admin', 'police_command', 'police_officer')
  getDistrictStats() {
    return this.dashboardService.getDistrictStats();
  }

  @Get('incidents/recent')
  @Roles('super_admin', 'police_command', 'police_officer')
  getRecentIncidents(@Query('limit') limit?: number) {
    return this.dashboardService.getRecentIncidents(limit);
  }
}
