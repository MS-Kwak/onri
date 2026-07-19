export type Identity =
  | 'FTM'
  | 'MTF'
  | 'NONBINARY'
  | 'TRANS'
  | 'CIS'
  | 'OTHER';

export type RelationGoal = 'DATING' | 'FRIEND' | 'INFO';

export type Visibility = 'public' | 'private';

export type VerificationStatus =
  | 'none'
  | 'pending'
  | 'approved'
  | 'rejected';

export type Profile = {
  id: string;
  nickname: string;
  age: number;
  region: string;
  thumbnailUrl: string;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  identity: Identity;
  identityOther?: string;
  lookingFor: RelationGoal[];
  bio: string;
  height: number | null;
  weight: number | null;
  interests: string[];
  activeTime: string[];
  visibility: {
    region: Visibility;
    age: Visibility;
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
  user1_id: string;
  user2_id: string;
  signal_id: string | null;
  is_active: boolean;
  created_at: string;
};

export type ChatRoomWithPartner = ChatRoom & {
  partner: {
    id: string;
    nickname: string;
    age: number;
    verification_status: VerificationStatus;
    thumbnailUrl: string | null;
  };
  lastMessage: Message | null;
  unreadCount: number;
};

export type Message = {
  id: string;
  room_id: string;
  sender_id: string;
  text: string;
  read_at: string | null;
  created_at: string;
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
