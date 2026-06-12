import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import type { Profile, UserRole } from '../types/auth.types'

interface AuthStore {
  user:                   User | null
  profile:                Profile | null
  isLoading:              boolean
  isAuthenticated:        boolean
  hasCompletedOnboarding: boolean

  setUser:    (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  clearAuth:  () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user:                   null,
  profile:                null,
  isLoading:              true,
  isAuthenticated:        false,
  hasCompletedOnboarding: false,

  setUser: (user) =>
    set({ user, isAuthenticated: !!user }),

  setProfile: (profile) =>
    set({
      profile,
      hasCompletedOnboarding: profile?.onboardingComplete ?? false,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  clearAuth: () =>
    set({
      user:                   null,
      profile:                null,
      isAuthenticated:        false,
      hasCompletedOnboarding: false,
    }),
}))

// Convenience selector
export const selectRole = (s: AuthStore): UserRole =>
  s.profile?.role ?? 'visitor'
