import type { HeartSend, HeartSendStatus } from '@/types';

export const MOCK_RECEIVED_SIGNALS: HeartSend[] = [
  {
    id: 'r1',
    fromUserId: '1',
    toUserId: 'me',
    status: 'PENDING',
    createdAt: '2026-07-09T14:30:00Z',
  },
  {
    id: 'r2',
    fromUserId: '2',
    toUserId: 'me',
    status: 'PENDING',
    createdAt: '2026-07-09T10:00:00Z',
  },
  {
    id: 'r3',
    fromUserId: '4',
    toUserId: 'me',
    status: 'PENDING',
    createdAt: '2026-07-08T20:00:00Z',
  },
  {
    id: 'r4',
    fromUserId: '6',
    toUserId: 'me',
    status: 'ACCEPTED',
    createdAt: '2026-07-07T15:00:00Z',
  },
];

export const MOCK_SENT_SIGNALS: HeartSend[] = [
  {
    id: 's1',
    fromUserId: 'me',
    toUserId: '5',
    status: 'PENDING',
    createdAt: '2026-07-09T12:00:00Z',
  },
  {
    id: 's2',
    fromUserId: 'me',
    toUserId: '3',
    status: 'ACCEPTED',
    createdAt: '2026-07-08T18:00:00Z',
  },
  {
    id: 's3',
    fromUserId: 'me',
    toUserId: '8',
    status: 'DECLINED',
    createdAt: '2026-07-07T09:00:00Z',
  },
  {
    id: 's4',
    fromUserId: 'me',
    toUserId: '7',
    status: 'EXPIRED',
    createdAt: '2026-07-05T11:00:00Z',
  },
];
