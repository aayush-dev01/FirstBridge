import { useAuthStore } from '../stores/authStore'

export function useAuth() {
  const { user, profile, isLoading, isAuthenticated, hasCompletedOnboarding } = useAuthStore()

  const role = profile?.role ?? 'visitor'

  return {
    user,
    profile,
    role,
    isLoading,
    isAuthenticated,
    hasCompletedOnboarding,

    // Role helpers
    isStudent:  role === 'student',
    isScholar:  role === 'scholar',
    isMentor:   role === 'mentor',
    isStaff:    role === 'staff',
    isAlumni:   role === 'alumni',
    isDonor:    role === 'donor',
    isParent:   role === 'parent',
    isSchoolRep:role === 'school_rep',
    isVisitor:  role === 'visitor',
  }
}
