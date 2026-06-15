import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupsModule } from '../groups/groups.module';
import { Wish, WishSchema } from './wish.schema';
import { WishesController } from './wishes.controller';
import { WishesService } from './wishes.service';

/** Wish submission and query module. */
@Module({
  controllers: [WishesController],
  exports: [WishesService, MongooseModule],
  imports: [GroupsModule, MongooseModule.forFeature([{ name: Wish.name, schema: WishSchema }])],
  providers: [WishesService],
})
export class WishesModule {}
