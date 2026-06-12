import type { UserRole } from '../types/auth.types'

// ─── Color tokens ─────────────────────────────────────────────────────────────
export const Colors = {
  primary:       '#1A3A6B',
  primaryMid:    '#2563EB',
  accent:        '#F97316',
  accentWarm:    '#FBBF24',
  bg:            '#F8FAFF',
  surface:       '#FFFFFF',
  surfaceAlt:    '#EEF3FB',
  textPrimary:   '#111827',
  textSecondary: '#6B7280',
  textInverse:   '#FFFFFF',
  border:        '#D1D9F0',
  success:       '#10B981',
  error:         '#EF4444',
  warning:       '#F59E0B',
} as const

// ─── Spacing scale (4-base) ───────────────────────────────────────────────────
export const Spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  xxl:  32,
  xxxl: 48,
} as const

// ─── Border radii ─────────────────────────────────────────────────────────────
export const Radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  28,
  full: 9999,
} as const

// ─── Shadows ──────────────────────────────────────────────────────────────────
export const Shadow = {
  sm: {
    shadowColor:   '#1A3A6B',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius:  6,
    elevation:     2,
  },
  md: {
    shadowColor:   '#1A3A6B',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius:  12,
    elevation:     6,
  },
  lg: {
    shadowColor:   '#1A3A6B',
    shadowOffset:  { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius:  20,
    elevation:     10,
  },
} as const

// ─── Font sizes ───────────────────────────────────────────────────────────────
export const FontSize = {
  xs:   11,
  sm:   13,
  md:   15,
  lg:   17,
  xl:   20,
  xxl:  24,
  xxxl: 30,
} as const

// ─── Font families ────────────────────────────────────────────────────────────
export const FontFamily = {
  display:      'Nunito_700Bold',
  displayBold:  'Nunito_800ExtraBold',
  displayBlack: 'Nunito_900Black',
  body:         'Inter_400Regular',
  bodyMedium:   'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold:     'Inter_700Bold',
} as const

// ─── Role metadata ────────────────────────────────────────────────────────────
export const ROLE_META: Record<UserRole, {
  label:     string
  description: string
  icon:      string
  color:     string
  textColor: string
}> = {
  student:    { label: 'Student',               description: 'Seeking scholarship & guidance',  icon: 'school-outline',    color: '#DBEAFE', textColor: '#1D4ED8' },
  scholar:    { label: 'Scholar',               description: 'Currently on a scholarship',       icon: 'ribbon-outline',    color: '#FEF3C7', textColor: '#92400E' },
  mentor:     { label: 'Mentor',                description: 'Guiding students & scholars',      icon: 'person-outline',    color: '#EDE9FE', textColor: '#4C1D95' },
  staff:      { label: 'Staff',                 description: 'FirstBridge team member',          icon: 'briefcase-outline', color: '#D1FAE5', textColor: '#065F46' },
  alumni:     { label: 'Alumni',                description: 'Former scholar, giving back',       icon: 'star-outline',      color: '#FAF5FF', textColor: '#6B21A8' },
  donor:      { label: 'Donor',                 description: 'Supporting students financially',  icon: 'heart-outline',     color: '#FFF7ED', textColor: '#9A3412' },
  parent:     { label: 'Parent / Guardian',     description: 'Supporting a scholar',            icon: 'home-outline',      color: '#F0FDFA', textColor: '#115E59' },
  school_rep: { label: 'School Representative', description: 'Representing an institution',      icon: 'business-outline',  color: '#FFF1F2', textColor: '#9F1239' },
  visitor:    { label: 'Just Exploring',        description: 'Browse without committing',        icon: 'compass-outline',   color: '#F3F4F6', textColor: '#374151' },
}

export const ROLE_ROUTES: Record<UserRole, string> = {
  student:    '/(student)/dashboard',
  scholar:    '/(scholar)/dashboard',
  mentor:     '/(mentor)/dashboard',
  staff:      '/(staff)/dashboard',
  alumni:     '/(alumni)/dashboard',
  donor:      '/(donor)/dashboard',
  parent:     '/(parent)/dashboard',
  school_rep: '/(school_rep)/dashboard',
  visitor:    '/(public)/home',
}
