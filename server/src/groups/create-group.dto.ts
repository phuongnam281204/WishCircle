import { IsString, MaxLength, MinLength } from 'class-validator';

/** Input for creating a new WishCircle group. */
export class CreateGroupDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  readonly name: string;
}
