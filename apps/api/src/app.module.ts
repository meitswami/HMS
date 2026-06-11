import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { HotelsModule } from './modules/hotels/hotels.module';
import { GuestsModule } from './modules/guests/guests.module';
import { OcrModule } from './modules/ocr/ocr.module';
import { WatchlistModule } from './modules/watchlist/watchlist.module';
import { IncidentsModule } from './modules/incidents/incidents.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuditModule } from './modules/audit/audit.module';
import { StorageModule } from './modules/storage/storage.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { AiModule } from './modules/ai/ai.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { DataRequestsModule } from './modules/data-requests/data-requests.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: config.get('DB_SYNC', 'false') === 'true',
        ssl: config.get('DB_SSL', 'false') === 'true' ? { rejectUnauthorized: false } : false,
        timezone: 'Z',
        charset: 'utf8mb4',
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ([{
        ttl: config.get<number>('RATE_LIMIT_TTL', 60) * 1000,
        limit: config.get<number>('RATE_LIMIT_MAX', 100),
      }]),
    }),
    AuthModule,
    UsersModule,
    HotelsModule,
    GuestsModule,
    OcrModule,
    WatchlistModule,
    IncidentsModule,
    AnalyticsModule,
    NotificationsModule,
    AuditModule,
    StorageModule,
    WebsocketModule,
    AiModule,
    DashboardModule,
    DataRequestsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
