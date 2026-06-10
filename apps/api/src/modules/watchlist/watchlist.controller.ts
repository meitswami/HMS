import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WatchlistService } from './watchlist.service';
import { CreateWatchlistDto } from './dto/watchlist.dto';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('watchlist')
@ApiBearerAuth()
@Controller('watchlist')
export class WatchlistController {
  constructor(private watchlistService: WatchlistService) {}

  @Post()
  @Roles('super_admin', 'police_command', 'police_officer')
  @ApiOperation({ summary: 'Add entry to watchlist/blacklist' })
  create(@Body() dto: CreateWatchlistDto, @CurrentUser() user: AuthUser) {
    return this.watchlistService.create(dto, user.id);
  }

  @Get()
  @Roles('super_admin', 'police_command', 'police_officer')
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('source') source?: string,
  ) {
    return this.watchlistService.findAll(page, limit, source);
  }
}
