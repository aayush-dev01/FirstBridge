import type { User } from '@supabase/supabase-js'
import { supabase }   from '../lib/supabase'
import { mapProfile } from '../types/auth.types'
import type { AuthProvider, Profile, UserRole } from '../types/auth.types'

// ─── Error messages ───────────────────────────────────────────────────────────
export const AUTH_ERRORS = {
  INVALID_PHONE:    'Please enter a valid 10-digit mobile number',
  OTP_NOT_RECEIVED: "Didn't get a code? Check your number and try resending.",
  WRONG_OTP:        "That code doesn't match. Please check and try again.",
  OTP_EXPIRED:      'This code has expired. Please request a new one.',
  TOO_MANY:         'Too many attempts. Please wait 10 minutes and try again.',
  NETWORK:          'No internet connection. Please check and retry.',
  GOOGLE_CANCELLED: 'Google sign-in was cancelled.',
  UNKNOWN:          'Something went wrong. Please try again.',
} as const

function classifyError(err: unknown): string {
  if (!err) return AUTH_ERRORS.UNKNOWN
  const msg = (err as Error).message?.toLowerCase() ?? ''
  if (msg.includes('network') || msg.includes('fetch'))  return AUTH_ERRORS.NETWORK
  if (msg.includes('expired'))                           return AUTH_ERRORS.OTP_EXPIRED
  if (msg.includes('invalid') && msg.includes('otp'))    return AUTH_ERRORS.WRONG_OTP
  if (msg.includes('rate') || msg.includes('too many'))  return AUTH_ERRORS.TOO_MANY
  if (msg.includes('phone'))                             return AUTH_ERRORS.INVALID_PHONE
  return AUTH_ERRORS.UNKNOWN
}

// ─── Send OTP ─────────────────────────────────────────────────────────────────
export async function sendOTP(e164Phone: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signInWithOtp({ phone: e164Phone })
    if (error) return { error: classifyError(error) }
    return { error: null }
  } catch (err) {
    return { error: classifyError(err) }
  }
}

// ─── Verify OTP ───────────────────────────────────────────────────────────────
export async function verifyOTP(
  e164Phone: string,
  token:     string,
): Promise<{ user: User | null; isNewUser: boolean; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: e164Phone,
      token,
      type:  'sms',
    })
    if (error || !data.user) return { user: null, isNewUser: false, error: classifyError(error) }

    const existingProfile = await loadProfile(data.user.id)
    return { user: data.user, isNewUser: !existingProfile, error: null }
  } catch (err) {
    return { user: null, isNewUser: false, error: classifyError(err) }
  }
}

// ─── Google Sign-In (stub — native build required) ───────────────────────────
// TODO: wire up @react-native-google-signin/google-signin after running
//       `npx expo run:android` / `eas build --profile development`
export async function signInWithGoogle(): Promise<{
  user: User | null
  isNewUser: boolean
  error: string | null
}> {
  return { user: null, isNewUser: false, error: 'Google Sign-In coming soon.' }
}

// ─── Create profile ───────────────────────────────────────────────────────────
export async function createProfile(
  userId:       string,
  name:         string,
  phone:        string | null,
  email:        string | null,
  role:         UserRole,
  avatarUrl:    string | null = null,
  authProvider: AuthProvider  = 'phone',
): Promise<{ profile: Profile | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        user_id:             userId,
        name,
        phone,
        email,
        role,
        avatar_url:          avatarUrl,
        auth_provider:       authProvider,
        onboarding_complete: true,
      })
      .select()
      .single()

    if (error || !data) return { profile: null, error: classifyError(error) }
    return { profile: mapProfile(data as Record<string, unknown>), error: null }
  } catch (err) {
    return { profile: null, error: classifyError(err) }
  }
}

// ─── Load profile ─────────────────────────────────────────────────────────────
export async function loadProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !data) return null
    return mapProfile(data as Record<string, unknown>)
  } catch {
    return null
  }
}

// ─── Update role ──────────────────────────────────────────────────────────────
export async function updateRole(
  userId: string,
  role:   UserRole,
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('user_id', userId)

    if (error) return { error: classifyError(error) }
    return { error: null }
  } catch (err) {
    return { error: classifyError(err) }
  }
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export async function logout(): Promise<void> {
  await supabase.auth.signOut()
}

// ─── Auth state listener ──────────────────────────────────────────────────────
export function onAuthStateChange(
  callback: (event: string, user: User | null) => void,
) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session?.user ?? null)
  })
}

// ─── Get current session ──────────────────────────────────────────────────────
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}
