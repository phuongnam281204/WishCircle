import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupsModule } from '../groups/groups.module';
import { UsersModule } from '../users/users.module';
import { WishesModule } from '../wishes/wishes.module';
import { BirthdayPage, BirthdayPageSchema } from './birthday-page.schema';
import { BirthdayPagesController } from './birthday-pages.controller';
import { BirthdayPagesService } from './birthday-pages.service';

/** Birthday page generation and public rendering module. */
@Module({
  controllers: [BirthdayPagesController],
  exports: [BirthdayPagesService],
  imports: [
    GroupsModule,
    UsersModule,
    WishesModule,
    MongooseModule.forFeature([{ name: BirthdayPage.name, schema: BirthdayPageSchema }]),
  ],
  providers: [BirthdayPagesService],
})
export class BirthdayPagesModule {}
