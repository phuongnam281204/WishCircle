import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { Group, GroupSchema } from './group.schema';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';

/** Group and membership module. */
@Module({
  controllers: [GroupsController],
  exports: [GroupsService, MongooseModule],
  imports: [UsersModule, MongooseModule.forFeature([{ name: Group.name, schema: GroupSchema }])],
  providers: [GroupsService],
})
export class GroupsModule {}
