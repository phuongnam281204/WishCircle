import { GroupMember } from './group-member.type';

export type GroupResponse = {
  readonly _id: string;
  readonly adminId: string;
  readonly inviteCode: string;
  readonly members: GroupMember[];
  readonly name: string;
};
