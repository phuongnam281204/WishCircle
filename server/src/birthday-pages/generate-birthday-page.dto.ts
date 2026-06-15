import { IsMongoId, IsOptional, IsString } from 'class-validator';

/** Input for manually generating a birthday page. */
export class GenerateBirthdayPageDto {
  @IsMongoId()
  readonly groupId: string;

  @IsMongoId()
  readonly toUserId: string;

  @IsOptional()
  @IsString()
  readonly birthdayYear?: string;
}
