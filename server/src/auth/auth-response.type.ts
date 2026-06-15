import { UserDocument } from '../users/user.schema';

export type AuthResponse = {
  readonly accessToken: string;
  readonly user: UserDocument;
};
