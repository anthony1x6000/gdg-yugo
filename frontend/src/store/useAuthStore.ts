import { create } from 'zustand';

interface User {
    id: string;
    username: string | null;
    highscore: number;
    profilePictureUrl: string | null;
}

interface AuthState {
    user: User | null;
    setUser: (user: User | null) => void;
    updateHighscore: (score: number) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    setUser: (user) => set({ user }),
    updateHighscore: (score) => set((state) => ({
        user: state.user ? { ...state.user, highscore: Math.max(state.user.highscore, score) } : null
    })),
    clearAuth: () => set({ user: null }),
}));
