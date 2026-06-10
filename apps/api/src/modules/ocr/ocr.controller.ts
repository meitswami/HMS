import {
  Controller, Get, Post, Put, Param, Query, UploadedFile,
  UseInterceptors, ParseUUIDPipe, Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { OcrService } from './ocr.service';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('ocr')
@ApiBearerAuth()
@Controller('ocr')
export class OcrController {
  constructor(private ocrService: OcrService) {}

  @Post('upload')
  @Roles('receptionist', 'hotel_manager')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload register page/PDF for OCR digitization' })
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('hotelId') hotelId: string,
    @Body('scanType') scanType: string,
    @Body('engine') engine: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.ocrService.uploadAndProcess(
      file, hotelId, user.tenantId, user.id, scanType || 'register_page', engine,
    );
  }

  @Get()
  findAll(
    @Query('hotelId') hotelId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.ocrService.findAll(hotelId, page, limit);
  }

  @Put(':id/approve')
  @Roles('hotel_manager', 'hotel_owner')
  approve(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return this.ocrService.approve(id, user.id);
  }

  @Put(':id/reject')
  @Roles('hotel_manager', 'hotel_owner')
  reject(@Param('id', ParseUUIDPipe) id: string) {
    return this.ocrService.reject(id);
  }
}
