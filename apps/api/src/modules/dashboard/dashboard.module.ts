import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Hotel } from '../../entities/hotel.entity';
import { Guest } from '../../entities/guest.entity';
import { Incident } from '../../entities/incident.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Hotel, Guest, Incident])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
