import type { ChatRoom, Message } from '@/types';

export const MOCK_CHAT_ROOMS: ChatRoom[] = [
  {
    id: 'room-1',
    userIds: ['me', '1'],
    createdAt: '2026-07-06T10:00:00Z',
  },
  {
    id: 'room-2',
    userIds: ['me', '2'],
    createdAt: '2026-07-07T14:00:00Z',
  },
  {
    id: 'room-3',
    userIds: ['me', '5'],
    createdAt: '2026-07-08T09:00:00Z',
  },
];

export const MOCK_MESSAGES: Record<string, Message[]> = {
  'room-1': [
    {
      id: 'm1-1',
      roomId: 'room-1',
      senderId: '1',
      text: '안녕하세요! 시그널 수락해주셔서 감사해요 😊',
      readAt: '2026-07-06T10:01:00Z',
      createdAt: '2026-07-06T10:00:00Z',
    },
    {
      id: 'm1-2',
      roomId: 'room-1',
      senderId: 'me',
      text: '안녕하세요~ 저도 반가워요!',
      readAt: '2026-07-06T10:02:00Z',
      createdAt: '2026-07-06T10:01:30Z',
    },
    {
      id: 'm1-3',
      roomId: 'room-1',
      senderId: '1',
      text: '프로필 보니까 음악 좋아하시는 것 같던데, 어떤 장르 좋아하세요?',
      readAt: '2026-07-06T10:03:00Z',
      createdAt: '2026-07-06T10:02:30Z',
    },
    {
      id: 'm1-4',
      roomId: 'room-1',
      senderId: 'me',
      text: '인디 음악이랑 R&B 좋아해요. 윤재님은요?',
      readAt: '2026-07-06T10:04:00Z',
      createdAt: '2026-07-06T10:03:30Z',
    },
    {
      id: 'm1-5',
      roomId: 'room-1',
      senderId: '1',
      text: '오 저도 인디 좋아해요! 혹시 이번 주말에 공연 보러 갈 생각 있으세요?',
      readAt: '2026-07-06T10:05:00Z',
      createdAt: '2026-07-06T10:04:30Z',
    },
    {
      id: 'm1-6',
      roomId: 'room-1',
      senderId: 'me',
      text: '좋아요! 어디서 하는 공연이에요?',
      readAt: null,
      createdAt: '2026-07-06T10:05:30Z',
    },
  ],
  'room-2': [
    {
      id: 'm2-1',
      roomId: 'room-2',
      senderId: 'me',
      text: '안녕하세요 서진님! 영화 좋아하신다고 해서 시그널 보냈어요',
      readAt: '2026-07-07T14:01:00Z',
      createdAt: '2026-07-07T14:00:00Z',
    },
    {
      id: 'm2-2',
      roomId: 'room-2',
      senderId: '2',
      text: '안녕하세요! 맞아요 영화 엄청 좋아해요 ㅎㅎ',
      readAt: '2026-07-07T14:02:00Z',
      createdAt: '2026-07-07T14:01:30Z',
    },
    {
      id: 'm2-3',
      roomId: 'room-2',
      senderId: '2',
      text: '최근에 본 영화 중에 추천할 만한 거 있으세요?',
      readAt: '2026-07-07T14:03:00Z',
      createdAt: '2026-07-07T14:02:00Z',
    },
    {
      id: 'm2-4',
      roomId: 'room-2',
      senderId: 'me',
      text: '요즘 본 중에 "과거의 내일"이 좋았어요. 감성적이면서도 생각할 거리가 많은 영화였어요',
      readAt: null,
      createdAt: '2026-07-07T14:03:30Z',
    },
  ],
  'room-3': [
    {
      id: 'm3-1',
      roomId: 'room-3',
      senderId: '5',
      text: '안녕하세요~ 카페 좋아하시는군요!',
      readAt: '2026-07-08T09:01:00Z',
      createdAt: '2026-07-08T09:00:00Z',
    },
    {
      id: 'm3-2',
      roomId: 'room-3',
      senderId: 'me',
      text: '네! 카페 탐방 다니는 거 좋아해요 ☕',
      readAt: '2026-07-08T09:02:00Z',
      createdAt: '2026-07-08T09:01:30Z',
    },
    {
      id: 'm3-3',
      roomId: 'room-3',
      senderId: '5',
      text: '혹시 서울에서 분위기 좋은 카페 아시는 데 있으세요?',
      readAt: null,
      createdAt: '2026-07-08T09:02:30Z',
    },
  ],
};
