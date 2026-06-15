import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { BirthdayPagesModule } from './birthday-pages/birthday-pages.module';
import { GroupsModule } from './groups/groups.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { UsersModule } from './users/users.module';
import { WishesModule } from './wishes/wishes.module';

/** Root application module that wires all WishCircle domains. */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI', 'mongodb://127.0.0.1:27017/wishcircle'),
      }),
    }),
    ScheduleModule.forRoot(),
    UsersModule,
    AuthModule,
    GroupsModule,
    WishesModule,
    BirthdayPagesModule,
    NotificationsModule,
    SchedulerModule,
  ],
})
export class AppModule {}
