import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuestsController } from './guests.controller';
import { GuestsService } from './guests.service';
import { Guest } from '../../entities/guest.entity';
import { GuestDocument } from '../../entities/guest-document.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import { WatchlistModule } from '../watchlist/watchlist.module';
import { IncidentsModule } from '../incidents/incidents.module';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Guest, GuestDocument, Vehicle]),
    WatchlistModule,
    IncidentsModule,
    WebsocketModule,
  ],
  controllers: [GuestsController],
  providers: [GuestsService],
  exports: [GuestsService],
})
export class GuestsModule {}
