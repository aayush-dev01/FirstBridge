import { useEffect, useRef, useState } from 'react'
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import { Ionicons }  from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { HeroHeader }         from '../../src/components/auth/HeroHeader'
import { Button }             from '../../src/components/ui/Button'
import { PhoneInput }         from '../../src/components/ui/PhoneInput'
import { OTPInput }           from '../../src/components/ui/OTPInput'
import { FloatingLabelInput } from '../../src/components/ui/FloatingLabelInput'
import { RoleCard }           from '../../src/components/ui/RoleCard'
import { ProgressSteps }      from '../../src/components/ui/ProgressSteps'
import { Colors, FontFamily, FontSize, Radius, Shadow, Spacing } from '../../src/lib/theme'
import { ROLE_ROUTES }        from '../../src/lib/theme'
import {
  sendOTP,
  verifyOTP,
  createProfile,
  AUTH_ERRORS,
} from '../../src/services/auth.service'
import { useAuthStore } from '../../src/stores/authStore'
import type { UserRole } from '../../src/types/auth.types'

const { height: H } = Dimensions.get('window')
const RESEND_SECS   = 60

const ALL_ROLES: UserRole[] = [
  'student', 'scholar', 'mentor', 'staff',
  'alumni',  'donor',   'parent', 'school_rep', 'visitor',
]

const STEP_LABELS = ['Phone', 'Verify', 'Name', 'Role']

export default function SignupScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { user, setUser, setProfile, setLoading } = useAuthStore()

  const [step,        setStep]        = useState<0 | 1 | 2 | 3>(0)
  const [rawPhone,    setRawPhone]    = useState('')
  const [e164Phone,   setE164Phone]   = useState('')
  const [phoneValid,  setPhoneValid]  = useState(false)
  const [phoneError,  setPhoneError]  = useState<string | null>(null)
  const [name,        setName]        = useState('')
  const [nameError,   setNameError]   = useState<string | null>(null)
  const [selectedRole,setSelectedRole]= useState<UserRole | null>(null)

  const [sending,    setSending]    = useState(false)
  const [verifying,  setVerifying]  = useState(false)
  const [creating,   setCreating]   = useState(false)
  const [otpError,   setOtpError]   = useState<string | null>(null)
  const [banner,     setBanner]     = useState<string | null>(null)
  const [countdown,  setCountdown]  = useState(0)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Card mount animation
  const cardY = useSharedValue(200)
  const cardO = useSharedValue(0)

  // Step content slide
  const slideX = useSharedValue(0)

  useEffect(() => {
    cardY.value = withSpring(0, { mass: 0.7, damping: 20, stiffness: 220 })
    cardO.value = withTiming(1, { duration: 220 })
    return () => { if (countdownRef.current) clearInterval(countdownRef.current) }
  }, [])

  const animateStep = (dir: 1 | -1) => {
    slideX.value = withSequence(
      withTiming(dir * 44, { duration: 0 }),
      withSpring(0, { mass: 0.5, damping: 18, stiffness: 260 }),
    )
  }

  const goNext = (dir: 1 | -1 = 1) => {
    animateStep(dir)
    setStep((s) => Math.max(0, Math.min(3, s + dir)) as 0 | 1 | 2 | 3)
  }

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardY.value }],
    opacity:   cardO.value,
  }))

  const stepStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }],
  }))

  // ── Countdown ──────────────────────────────────────────────────────────────
  const startCountdown = () => {
    setCountdown(RESEND_SECS)
    if (countdownRef.current) clearInterval(countdownRef.current)
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(countdownRef.current!); return 0 }
        return c - 1
      })
    }, 1000)
  }

  // ── Step 0: Send OTP ───────────────────────────────────────────────────────
  const handleSendOTP = async () => {
    if (!phoneValid) { setPhoneError(AUTH_ERRORS.INVALID_PHONE); return }
    setPhoneError(null)
    setBanner(null)
    setSending(true)
    const { error } = await sendOTP(e164Phone)
    setSending(false)
    if (error) { setBanner(error); return }
    startCountdown()
    goNext()
  }

  // ── Step 1: Verify OTP ─────────────────────────────────────────────────────
  const handleVerifyOTP = async (code: string) => {
    setOtpError(null)
    setBanner(null)
    setVerifying(true)
    setLoading(true)

    const { user: authedUser, isNewUser, error } = await verifyOTP(e164Phone, code)
    setVerifying(false)
    setLoading(false)

    if (error || !authedUser) { setOtpError(error ?? AUTH_ERRORS.UNKNOWN); return }

    setUser(authedUser)

    if (!isNewUser) {
      // Existing user — go straight to their dashboard
      router.replace('/(auth)/login')
      return
    }

    goNext()
  }

  // ── Step 2: Validate name ──────────────────────────────────────────────────
  const handleNameContinue = () => {
    const trimmed = name.trim()
    if (trimmed.length < 2) { setNameError('Name must be at least 2 characters'); return }
    if (!/^[A-Za-z\s'.'-]+$/.test(trimmed)) { setNameError('Please enter a valid name'); return }
    setNameError(null)
    goNext()
  }

  // ── Step 3: Create profile ─────────────────────────────────────────────────
  const handleCreateProfile = async () => {
    if (!selectedRole || !user) return
    setBanner(null)
    setCreating(true)
    setLoading(true)

    const { profile, error } = await createProfile(
      user.id,
      name.trim(),
      e164Phone || null,
      user.email ?? null,
      selectedRole,
      user.user_metadata?.avatar_url ?? null,
      user.app_metadata?.provider === 'google' ? 'google' : 'phone',
    )

    setCreating(false)
    setLoading(false)

    if (error || !profile) { setBanner(error ?? AUTH_ERRORS.UNKNOWN); return }

    setProfile(profile)
    router.replace(ROLE_ROUTES[selectedRole] as never)
  }

  const maskedPhone = e164Phone.replace(/(\+\d{2})(\d{6})(\d{4})/, '$1••••••$3')

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={s.root}>
        <HeroHeader height={H * 0.30} subtitle="Create your account" />

        <Animated.View style={[s.card, { paddingBottom: insets.bottom + 24 }, cardStyle]}>
          {/* Progress steps */}
          <View style={s.progressWrap}>
            <ProgressSteps total={4} current={step} labels={STEP_LABELS} />
          </View>

          <ScrollView
            contentContainerStyle={s.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Back button — step 0 goes to welcome, later steps go back a step */}
            <TouchableOpacity
              style={s.backBtn}
              onPress={() => step === 0 ? router.back() : goNext(-1)}
              accessibilityLabel="Go back"
            >
              <Ionicons name="chevron-back" size={20} color={Colors.primary} />
            </TouchableOpacity>

            {/* Error banner */}
            {banner && (
              <View style={s.banner}>
                <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
                <Text style={s.bannerTxt}>{banner}</Text>
              </View>
            )}

            <Animated.View style={stepStyle}>

              {/* ── Step 0: Phone ─────────────────────────────────────────── */}
              {step === 0 && (
                <View style={s.stepWrap}>
                  <Text style={s.stepTitle}>What's your number?</Text>
                  <Text style={s.stepSub}>We'll send a code to verify it's you</Text>

                  <PhoneInput
                    value={rawPhone}
                    onChange={(raw, e164, valid) => {
                      setRawPhone(raw)
                      setE164Phone(e164)
                      setPhoneValid(valid)
                      setPhoneError(null)
                    }}
                    error={phoneError ?? undefined}
                    autoFocus
                  />

                  <Button
                    variant="primary"
                    size="lg"
                    label={sending ? 'Sending…' : 'Send OTP →'}
                    fullWidth
                    loading={sending}
                    disabled={!phoneValid}
                    onPress={handleSendOTP}
                  />
                </View>
              )}

              {/* ── Step 1: OTP ───────────────────────────────────────────── */}
              {step === 1 && (
                <View style={s.stepWrap}>
                  <Text style={s.stepTitle}>Check your phone 📱</Text>
                  <Text style={s.stepSub}>
                    We sent a 6-digit code to{'\n'}
                    <Text style={s.boldTxt}>{maskedPhone}</Text>
                  </Text>

                  <OTPInput onComplete={handleVerifyOTP} disabled={verifying} />

                  {otpError && <Text style={s.otpError}>{otpError}</Text>}

                  <View style={s.resendRow}>
                    {countdown > 0 ? (
                      <Text style={s.countdown}>
                        Resend in <Text style={s.countdownNum}>{countdown}s</Text>
                      </Text>
                    ) : (
                      <TouchableOpacity onPress={handleSendOTP}>
                        <Text style={s.resendLink}>Resend OTP</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <Button
                    variant="primary"
                    size="lg"
                    label={verifying ? 'Verifying…' : 'Verify →'}
                    fullWidth
                    loading={verifying}
                    onPress={() => {}}
                  />
                </View>
              )}

              {/* ── Step 2: Name ─────────────────────────────────────────── */}
              {step === 2 && (
                <View style={s.stepWrap}>
                  <Text style={s.stepTitle}>What should we call you?</Text>
                  <Text style={s.stepSub}>This is how you'll appear on FirstBridge</Text>

                  <FloatingLabelInput
                    label="Full Name"
                    value={name}
                    onChangeText={(v) => { setName(v); setNameError(null) }}
                    error={nameError ?? undefined}
                    leftIcon={<Ionicons name="person-outline" size={20} color={Colors.textSecondary} />}
                    autoCapitalize="words"
                    maxLength={60}
                  />

                  <Button
                    variant="primary"
                    size="lg"
                    label="Continue →"
                    fullWidth
                    disabled={name.trim().length < 2}
                    onPress={handleNameContinue}
                  />
                </View>
              )}

              {/* ── Step 3: Role ─────────────────────────────────────────── */}
              {step === 3 && (
                <View style={s.stepWrap}>
                  <Text style={s.stepTitle}>I am a…</Text>
                  <Text style={s.stepSub}>Choose the role that best describes you</Text>

                  <View style={s.roleGrid}>
                    {ALL_ROLES.map((role) => (
                      <RoleCard
                        key={role}
                        role={role}
                        selected={selectedRole === role}
                        onSelect={setSelectedRole}
                      />
                    ))}
                  </View>

                  <Button
                    variant="accent"
                    size="lg"
                    label={creating ? 'Creating account…' : 'Create My Account →'}
                    fullWidth
                    loading={creating}
                    disabled={!selectedRole}
                    onPress={handleCreateProfile}
                  />
                </View>
              )}

            </Animated.View>

            {/* Sign-in link */}
            <View style={s.signinRow}>
              <Text style={s.signinTxt}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={s.signinLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },

  card: {
    flex:                 1,
    backgroundColor:      Colors.surface,
    borderTopLeftRadius:  Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    marginTop:            -Radius.xxl,
    ...Shadow.lg,
  },

  progressWrap: {
    paddingHorizontal: Spacing.xl,
    paddingTop:        Spacing.lg,
    paddingBottom:     Spacing.sm,
  },

  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop:        Spacing.md,
    paddingBottom:     Spacing.xxxl,
    gap:               Spacing.md,
  },

  backBtn: {
    width:           40,
    height:          40,
    borderRadius:    20,
    backgroundColor: Colors.surfaceAlt,
    alignItems:      'center',
    justifyContent:  'center',
    alignSelf:       'flex-start',
  },

  banner: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               8,
    backgroundColor:   '#FEF2F2',
    borderRadius:      Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical:   Spacing.sm,
    borderWidth:       1,
    borderColor:       '#FECACA',
  },
  bannerTxt: { flex: 1, fontFamily: FontFamily.body, fontSize: FontSize.sm, color: Colors.error },

  stepWrap:  { gap: Spacing.md },
  stepTitle: { fontFamily: FontFamily.displayBold, fontSize: FontSize.xl, color: Colors.textPrimary },
  stepSub:   { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  boldTxt:   { fontFamily: FontFamily.bodySemiBold, color: Colors.primary },

  otpError:    { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: Colors.error, textAlign: 'center' },
  resendRow:   { flexDirection: 'row', justifyContent: 'center' },
  countdown:   { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: Colors.textSecondary },
  countdownNum:{ fontFamily: FontFamily.bodySemiBold, color: Colors.primary },
  resendLink:  { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm, color: Colors.accent },

  roleGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           Spacing.sm,
    justifyContent:'space-between',
  },

  signinRow:  { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: Spacing.sm },
  signinTxt:  { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: Colors.textSecondary },
  signinLink: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm, color: Colors.accent },
})
