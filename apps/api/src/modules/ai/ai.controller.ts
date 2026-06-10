import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('search')
  @Roles('super_admin', 'police_command', 'police_officer', 'hotel_manager')
  @ApiOperation({ summary: 'Natural language guest search' })
  search(@Body('query') query: string, @CurrentUser() user: AuthUser) {
    return this.aiService.naturalLanguageSearch(query, user.tenantId);
  }
}
