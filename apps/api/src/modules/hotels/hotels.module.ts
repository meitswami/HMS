import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelsController } from './hotels.controller';
import { HotelsService } from './hotels.service';
import { Hotel } from '../../entities/hotel.entity';
import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Hotel, User, Role])],
  controllers: [HotelsController],
  providers: [HotelsService],
  exports: [HotelsService],
})
export class HotelsModule {}
