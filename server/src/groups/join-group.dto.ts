import { IsString, Length } from 'class-validator';
import { INVITE_CODE_LENGTH } from '../common/app.constants';

/** Input for joining a group by invite code. */
export class JoinGroupDto {
  @IsString()
  @Length(INVITE_CODE_LENGTH, INVITE_CODE_LENGTH)
  readonly inviteCode: string;
}
