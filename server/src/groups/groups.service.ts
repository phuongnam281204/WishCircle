import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'crypto';
import { Model, Types } from 'mongoose';
import { INVITE_CODE_LENGTH } from '../common/app.constants';
import { UsersService } from '../users/users.service';
import { Group, GroupDocument } from './group.schema';
import { GroupMember } from './group-member.type';
import { GroupResponse } from './group-response.type';

const INVITE_CODE_RANDOM_BYTES = 6;
const MAX_INVITE_GENERATION_ATTEMPTS = 10;

type PopulatedGroup = Omit<GroupDocument, 'members'> & {
  readonly members: GroupMember[];
};

type GroupMemberReference = Types.ObjectId | {
  readonly _id: Types.ObjectId | string;
};

/** Handles group membership and invite codes. */
@Injectable()
export class GroupsService {
  public constructor(
    @InjectModel(Group.name) private readonly groupModel: Model<GroupDocument>,
    private readonly usersService: UsersService,
  ) {}

  /** Creates a group with the authenticated user as admin and first member. */
  public async createGroup(userId: string, name: string): Promise<GroupResponse> {
    const userObjectId = new Types.ObjectId(userId);
    const inviteCode = await this.createUniqueInviteCode();
    const group = await this.groupModel.create({ adminId: userObjectId, inviteCode, members: [userObjectId], name });
    await this.usersService.addGroup(userId, group._id);
    return this.getGroup(group._id.toString(), userId);
  }

  /** Adds the authenticated user to a group by invite code. */
  public async joinGroup(userId: string, inviteCode: string): Promise<GroupResponse> {
    const group = await this.groupModel.findOne({ inviteCode: inviteCode.toUpperCase() }).exec();
    if (!group) {
      throw new NotFoundException('Invite code was not found.');
    }
    const userObjectId = new Types.ObjectId(userId);
    await this.groupModel.updateOne({ _id: group._id }, { $addToSet: { members: userObjectId } }).exec();
    await this.usersService.addGroup(userId, group._id);
    return this.getGroup(group._id.toString(), userId);
  }

  /** Lists groups where the authenticated user is a member. */
  public async listGroups(userId: string): Promise<GroupResponse[]> {
    const groups = await this.groupModel.find({ members: new Types.ObjectId(userId) }).populate('members').exec();
    return groups.map((group) => this.mapGroupResponse(group as unknown as PopulatedGroup));
  }

  /** Gets one group if the authenticated user is a member. */
  public async getGroup(groupId: string, userId: string): Promise<GroupResponse> {
    const group = await this.groupModel.findById(groupId).populate('members').exec();
    if (!group) {
      throw new NotFoundException('Group was not found.');
    }
    this.assertMembership(group, userId);
    return this.mapGroupResponse(group as unknown as PopulatedGroup);
  }

  /** Lists raw groups for scheduler work. */
  public async listGroupsByMember(userId: string): Promise<GroupDocument[]> {
    return this.groupModel.find({ members: new Types.ObjectId(userId) }).exec();
  }

  /** Gets a raw group document by id for internal workflows. */
  public async getRawGroupById(groupId: string): Promise<GroupDocument> {
    const group = await this.groupModel.findById(groupId).exec();
    if (!group) {
      throw new NotFoundException('Group was not found.');
    }
    return group;
  }

  /** Ensures a user belongs to a group before accessing related resources. */
  public async assertUserCanAccessGroup(groupId: string, userId: string): Promise<GroupDocument> {
    const group = await this.groupModel.findById(groupId).exec();
    if (!group) {
      throw new NotFoundException('Group was not found.');
    }
    this.assertMembership(group, userId);
    return group;
  }

  private assertMembership(group: GroupDocument, userId: string): void {
    const members = group.members as unknown as readonly GroupMemberReference[];
    const hasMembership = members.some((member) => this.getMemberId(member) === userId);
    if (!hasMembership) {
      throw new ForbiddenException('You are not a member of this group.');
    }
  }

  private getMemberId(member: GroupMemberReference): string {
    if (member instanceof Types.ObjectId) {
      return member.toString();
    }
    return member._id.toString();
  }

  private async createUniqueInviteCode(): Promise<string> {
    for (let i = 0; i < MAX_INVITE_GENERATION_ATTEMPTS; i += 1) {
      const inviteCode = randomBytes(INVITE_CODE_RANDOM_BYTES).toString('hex').slice(0, INVITE_CODE_LENGTH).toUpperCase();
      const existingGroup = await this.groupModel.exists({ inviteCode }).exec();
      if (!existingGroup) {
        return inviteCode;
      }
    }
    throw new Error('Unable to generate invite code.');
  }

  private mapGroupResponse(group: PopulatedGroup): GroupResponse {
    return {
      _id: group._id.toString(),
      adminId: group.adminId.toString(),
      inviteCode: group.inviteCode,
      members: group.members.map((member) => ({
        _id: member._id.toString(),
        birthday: member.birthday,
        name: member.name,
        phone: member.phone,
      })),
      name: group.name,
    };
  }
}
