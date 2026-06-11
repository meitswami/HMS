import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataRequestsController } from './data-requests.controller';
import { DataRequestsService } from './data-requests.service';
import { DataAccessRequest } from '../../entities/data-access-request.entity';
import { Guest } from '../../entities/guest.entity';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([DataAccessRequest, Guest]), AuditModule],
  controllers: [DataRequestsController],
  providers: [DataRequestsService],
  exports: [DataRequestsService],
})
export class DataRequestsModule {}
