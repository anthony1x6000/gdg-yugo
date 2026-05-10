import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ScoreState {
  score: number
  total: number
  incrementScore: () => void
  incrementTotal: () => void
  reset: () => void
}

export const useScoreStore = create<ScoreState>()(
  persist(
    (set) => ({
      score: 0,
      total: 0,
      incrementScore: () => set((state) => ({ score: state.score + 1 })),
      incrementTotal: () => set((state) => ({ total: state.total + 1 })),
      reset: () => set({ score: 0, total: 0 }),
    }),
    {
      name: 'guessr-score',
    }
  )
)
