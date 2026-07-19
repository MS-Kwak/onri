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
  SIGNAL: 3,
} as const;

export const HEART_REWARD = {
  SIGNUP: 10,
} as const;

export const ATTENDANCE_REWARD = {
  DAILY: 1,
  STREAK_3: 1,
  STREAK_7: 3,
} as const;

export type HeartPackage = {
  id: string;
  amount: number;
  price: number;
  label: string;
  popular?: boolean;
  best?: boolean;
};

export const HEART_PACKAGES: HeartPackage[] = [
  { id: 'h10', amount: 10, price: 2_500, label: '시작' },
  {
    id: 'h30',
    amount: 30,
    price: 5_900,
    label: '인기',
    popular: true,
  },
  { id: 'h60', amount: 60, price: 9_900, label: '알뜰하게' },
  {
    id: 'h120',
    amount: 120,
    price: 16_900,
    label: '넉넉하게',
    best: true,
  },
];

export const HEART_PACKAGE_MAP = Object.fromEntries(
  HEART_PACKAGES.map((p) => [p.id, p]),
) as Record<string, HeartPackage>;

export const PRICE_TO_PACKAGE = Object.fromEntries(
  HEART_PACKAGES.map((p) => [p.price, p]),
) as Record<number, HeartPackage>;
