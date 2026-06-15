export type User = {
  readonly _id: string;
  readonly birthday?: string;
  readonly name?: string;
  readonly phone: string;
};

export type GroupMember = User;

export type Group = {
  readonly _id: string;
  readonly adminId: string;
  readonly inviteCode: string;
  readonly members: GroupMember[];
  readonly name: string;
};

export type AuthResponse = {
  readonly accessToken: string;
  readonly user: User;
};

export type Wish = {
  readonly _id: string;
  readonly birthdayYear: number;
  readonly fromUserId: string;
  readonly groupId: string;
  readonly isAnonymous: boolean;
  readonly message: string;
  readonly photoUrl?: string;
  readonly toUserId: string;
};

export type PublicWish = {
  readonly _id: string;
  readonly fromName: string;
  readonly isAnonymous: boolean;
  readonly message: string;
  readonly photoUrl?: string;
};

export type BirthdayPage = {
  readonly _id: string;
  readonly birthdayYear: number;
  readonly expiresAt: string;
  readonly groupName: string;
  readonly recipientName: string;
  readonly token: string;
  readonly viewCount: number;
  readonly wishes: PublicWish[];
};

export type NotificationLog = {
  readonly _id: string;
  readonly message: string;
  readonly recipientPhone: string;
  readonly type: string;
};
