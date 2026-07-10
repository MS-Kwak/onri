export type Identity =
  | 'FTM'
  | 'MTF'
  | 'NONBINARY'
  | 'TRANS'
  | 'CIS'
  | 'OTHER';

export type RelationGoal = 'DATING' | 'FRIEND' | 'INFO';

export type Visibility = 'public' | 'private';

export type Profile = {
  id: string;
  nickname: string;
  age: number;
  region: string;
  thumbnailUrl: string;
  isVerified: boolean;
  identity: Identity;
  lookingFor: RelationGoal[];
  bio: string;
  interests: string[];
  activeTime: string;
  visibility: {
    identity: Visibility;
    region: Visibility;
  };
  createdAt: string;
};

export type HeartBalance = {
  userId: string;
  balance: number;
};

export type HeartSendStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'EXPIRED';

export type HeartSend = {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: HeartSendStatus;
  createdAt: string;
};

export type ChatRoom = {
  id: string;
  userIds: [string, string];
  createdAt: string;
};

export type Message = {
  id: string;
  roomId: string;
  senderId: string;
  text: string;
  readAt: string | null;
  createdAt: string;
};

export type Attendance = {
  userId: string;
  date: string;
  streak: number;
  rewardedHearts: number;
};

export type BlockRecord = {
  id: string;
  blockerId: string;
  blockedId: string;
  createdAt: string;
};

export type ReportReason =
  | 'SPAM'
  | 'HARASSMENT'
  | 'FAKE_PROFILE'
  | 'INAPPROPRIATE'
  | 'OTHER';

export type Report = {
  id: string;
  reporterId: string;
  targetId: string;
  reason: ReportReason;
  detail?: string;
  attachedMessageIds?: string[];
  createdAt: string;
};
