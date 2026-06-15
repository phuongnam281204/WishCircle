import { PublicWish } from './public-wish.type';

export type BirthdayPageResponse = {
  readonly _id: string;
  readonly birthdayYear: number;
  readonly expiresAt: Date;
  readonly groupName: string;
  readonly recipientName: string;
  readonly token: string;
  readonly viewCount: number;
  readonly wishes: PublicWish[];
};
