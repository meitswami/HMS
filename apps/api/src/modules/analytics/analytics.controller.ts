import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('report')
  @Roles('super_admin', 'police_command', 'hotel_manager', 'hotel_owner')
  @ApiOperation({ summary: 'Generate analytics report' })
  getReport(
    @Query('period') period: 'daily' | 'weekly' | 'monthly' | 'yearly',
    @Query('hotelId') hotelId: string,
    @Query('nationality') nationality: string,
    @Query('gender') gender: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.analyticsService.getReport({
      period: period || 'monthly',
      hotelId,
      nationality,
      gender,
      tenantId: user.tenantId,
    });
  }
}
