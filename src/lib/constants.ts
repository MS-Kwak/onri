export const BRAND = {
  name: '온리',
  nameEn: 'Onri',
  slogan: '온전한 나로 쉬어가는 곳',
} as const;

export const IDENTITY_LABELS: Record<string, string> = {
  FTM: 'FTM',
  MTF: 'MTF',
  NONBINARY: '논바이너리',
  TRANS: '트랜스',
  CIS: '시스',
  OTHER: '기타',
};

export const RELATION_GOAL_LABELS: Record<string, string> = {
  DATING: '연애',
  FRIEND: '친구',
  INFO: '정보교류',
};

export const HEART_COST = {
  SIGNAL: 1,
} as const;

export const HEART_REWARD = {
  SIGNUP: 10,
} as const;

export const ATTENDANCE_REWARD = {
  DAILY: 1,
  STREAK_3: 1,
  STREAK_7: 3,
} as const;
