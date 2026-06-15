import { IsBoolean, IsMongoId, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

const MAX_PHOTO_DATA_URL_LENGTH = 7 * 1024 * 1024;

/** Input for sending a birthday wish. */
export class CreateWishDto {
  @IsMongoId()
  readonly groupId: string;

  @IsMongoId()
  readonly toUserId: string;

  @IsString()
  @MinLength(2)
  @MaxLength(2000)
  readonly message: string;

  @IsOptional()
  @IsString()
  @MaxLength(MAX_PHOTO_DATA_URL_LENGTH)
  readonly photoUrl?: string;

  @IsBoolean()
  readonly isAnonymous: boolean = false;
}
