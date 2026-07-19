import { create } from 'zustand';
import type { Profile } from '@/types';

type AuthState = {
  isAuthenticated: boolean;
  currentUser: Profile | null;
  setAuthenticated: (user: Profile) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  currentUser: null,
  setAuthenticated: (user) =>
    set({ isAuthenticated: true, currentUser: user }),
  logout: () => set({ isAuthenticated: false, currentUser: null }),
}));

type HeartState = {
  balance: number;
  setBalance: (balance: number) => void;
  deduct: (amount: number) => boolean;
  add: (amount: number) => void;
};

export const useHeartStore = create<HeartState>((set, get) => ({
  balance: 0,
  setBalance: (balance) => set({ balance }),
  deduct: (amount) => {
    const current = get().balance;
    if (current < amount) return false;
    set({ balance: current - amount });
    return true;
  },
  add: (amount) =>
    set((state) => ({ balance: state.balance + amount })),
}));

type ChatState = {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
  decrementUnread: (by?: number) => void;
};

export const useChatStore = create<ChatState>((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  incrementUnread: () =>
    set((state) => ({ unreadCount: state.unreadCount + 1 })),
  decrementUnread: (by = 1) =>
    set((state) => ({
      unreadCount: Math.max(0, state.unreadCount - by),
    })),
}));
