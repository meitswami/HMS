import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { Guest } from '../../entities/guest.entity';
import { Incident } from '../../entities/incident.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Guest, Incident])],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
