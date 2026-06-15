import { IsDateString, IsString, MaxLength, MinLength } from 'class-validator';

/** Input for completing the user's profile after phone verification. */
export class SetupProfileDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  readonly name: string;

  @IsDateString()
  readonly birthday: string;
}
