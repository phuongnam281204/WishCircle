export type WishResponse = {
  readonly _id: string;
  readonly birthdayYear: number;
  readonly fromUserId: string;
  readonly groupId: string;
  readonly isAnonymous: boolean;
  readonly message: string;
  readonly photoUrl?: string;
  readonly toUserId: string;
};
