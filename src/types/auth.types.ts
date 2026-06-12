export type UserRole =
  | 'student'
  | 'scholar'
  | 'mentor'
  | 'staff'
  | 'alumni'
  | 'donor'
  | 'parent'
  | 'school_rep'
  | 'visitor'

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected'
export type AuthProvider       = 'phone' | 'google' | 'both'
export type SignupStep         = 0 | 1 | 2 | 3

export interface Profile {
  id:                 string
  userId:             string
  name:               string | null
  phone:              string | null
  email:              string | null
  avatarUrl:          string | null
  role:               UserRole
  verificationStatus: VerificationStatus
  onboardingComplete: boolean
  authProvider:       AuthProvider
  createdAt:          string
  updatedAt:          string
}

export interface AuthState {
  user:                   import('@supabase/supabase-js').User | null
  profile:                Profile | null
  isLoading:              boolean
  isAuthenticated:        boolean
  hasCompletedOnboarding: boolean
}

export function mapProfile(row: Record<string, unknown>): Profile {
  return {
    id:                 row.id                  as string,
    userId:             row.user_id             as string,
    name:               (row.name               as string | null) ?? null,
    phone:              (row.phone              as string | null) ?? null,
    email:              (row.email              as string | null) ?? null,
    avatarUrl:          (row.avatar_url         as string | null) ?? null,
    role:               (row.role               as UserRole) ?? 'visitor',
    verificationStatus: (row.verification_status as VerificationStatus) ?? 'unverified',
    onboardingComplete: (row.onboarding_complete as boolean) ?? false,
    authProvider:       (row.auth_provider      as AuthProvider) ?? 'phone',
    createdAt:          row.created_at          as string,
    updatedAt:          row.updated_at          as string,
  }
}
