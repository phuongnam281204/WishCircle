import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthenticatedUser } from '../auth/authenticated-user.type';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateGroupDto } from './create-group.dto';
import { GroupResponse } from './group-response.type';
import { GroupsService } from './groups.service';
import { JoinGroupDto } from './join-group.dto';

/** Group management endpoints. */
@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  public constructor(private readonly groupsService: GroupsService) {}

  /** Creates a group owned by the current user. */
  @Post()
  public async createGroup(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreateGroupDto,
  ): Promise<GroupResponse> {
    return this.groupsService.createGroup(currentUser.id, dto.name);
  }

  /** Joins a group using an invite code. */
  @Post('join')
  public async joinGroup(@CurrentUser() currentUser: AuthenticatedUser, @Body() dto: JoinGroupDto): Promise<GroupResponse> {
    return this.groupsService.joinGroup(currentUser.id, dto.inviteCode);
  }

  /** Lists all groups the current user belongs to. */
  @Get()
  public async listGroups(@CurrentUser() currentUser: AuthenticatedUser): Promise<GroupResponse[]> {
    return this.groupsService.listGroups(currentUser.id);
  }

  /** Gets a group with populated members. */
  @Get(':groupId')
  public async getGroup(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('groupId') groupId: string,
  ): Promise<GroupResponse> {
    return this.groupsService.getGroup(groupId, currentUser.id);
  }
}
