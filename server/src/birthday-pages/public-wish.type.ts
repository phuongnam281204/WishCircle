export type PublicWish = {
  readonly _id: string;
  readonly fromName: string;
  readonly isAnonymous: boolean;
  readonly message: string;
  readonly photoUrl?: string;
};
