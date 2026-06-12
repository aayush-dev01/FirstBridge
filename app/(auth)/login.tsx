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
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { HeroHeader }       from '../../src/components/auth/HeroHeader'
import { Button }           from '../../src/components/ui/Button'
import { PhoneInput }       from '../../src/components/ui/PhoneInput'
import { OTPInput }         from '../../src/components/ui/OTPInput'
import { Colors, FontFamily, FontSize, Radius, Shadow, Spacing } from '../../src/lib/theme'
import {
  sendOTP,
  verifyOTP,
  signInWithGoogle,
  loadProfile,
  AUTH_ERRORS,
} from '../../src/services/auth.service'
import { useAuthStore } from '../../src/stores/authStore'
import { ROLE_ROUTES }  from '../../src/lib/theme'

const { height: H } = Dimensions.get('window')
const RESEND_SECS   = 60

export default function LoginScreen() {
  const router  = useRouter()
  const insets  = useSafeAreaInsets()
  const { setUser, setProfile, setLoading } = useAuthStore()

  // Phone state
  const [rawPhone,  setRawPhone]  = useState('')
  const [e164Phone, setE164Phone] = useState('')
  const [phoneValid,setPhoneValid]= useState(false)
  const [phoneError,setPhoneError]= useState<string | null>(null)

  // OTP state
  const [otpSent,   setOtpSent]   = useState(false)
  const [otpError,  setOtpError]  = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Loading
  const [sending,   setSending]   = useState(false)
  const [verifying, setVerifying] = useState(false)

  // Error banner
  const [banner, setBanner] = useState<string | null>(null)

  // Card spring-up
  const cardY = useSharedValue(200)
  const cardO = useSharedValue(0)

  // OTP section slide-down
  const otpH   = useSharedValue(0)
  const otpO   = useSharedValue(0)

  useEffect(() => {
    cardY.value = withSpring(0, { mass: 0.7, damping: 20, stiffness: 220 })
    cardO.value = withTiming(1, { duration: 220 })
    return () => { if (countdownRef.current) clearInterval(countdownRef.current) }
  }, [])

  useEffect(() => {
    if (otpSent) {
      otpH.value = withTiming(1, { duration: 320, easing: Easing.out(Easing.ease) })
      otpO.value = withTiming(1, { duration: 260 })
    } else {
      otpH.value = withTiming(0, { duration: 200 })
      otpO.value = withTiming(0, { duration: 160 })
    }
  }, [otpSent])

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardY.value }],
    opacity:   cardO.value,
  }))

  const otpStyle = useAnimatedStyle(() => ({
    opacity:   otpO.value,
    maxHeight: otpH.value * 500,
    overflow:  'hidden' as const,
  }))

  // ── Send OTP ─────────────────────────────────────────────────────────────
  const handleSendOTP = async () => {
    if (!phoneValid) {
      setPhoneError(AUTH_ERRORS.INVALID_PHONE)
      return
    }
    setPhoneError(null)
    setBanner(null)
    setSending(true)
    const { error } = await sendOTP(e164Phone)
    setSending(false)

    if (error) { setBanner(error); return }

    setOtpSent(true)
    startCountdown()
  }

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

  // ── Verify OTP ───────────────────────────────────────────────────────────
  const handleVerify = async (code: string) => {
    setOtpError(null)
    setBanner(null)
    setVerifying(true)
    setLoading(true)

    const { user, isNewUser, error } = await verifyOTP(e164Phone, code)
    setVerifying(false)
    setLoading(false)

    if (error || !user) { setOtpError(error ?? AUTH_ERRORS.UNKNOWN); return }

    setUser(user)

    if (isNewUser) {
      // New user — go to signup to complete profile
      router.replace('/(auth)/signup')
      return
    }

    const profile = await loadProfile(user.id)
    if (profile) {
      setProfile(profile)
      router.replace(ROLE_ROUTES[profile.role] as never)
    } else {
      router.replace('/(auth)/signup')
    }
  }

  // ── Google ───────────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    setBanner(null)
    setLoading(true)
    const { user, isNewUser, error } = await signInWithGoogle()
    setLoading(false)

    if (error || !user) { setBanner(error ?? AUTH_ERRORS.UNKNOWN); return }

    setUser(user)
    if (isNewUser) { router.replace('/(auth)/signup'); return }

    const profile = await loadProfile(user.id)
    if (profile) {
      setProfile(profile)
      router.replace(ROLE_ROUTES[profile.role] as never)
    } else {
      router.replace('/(auth)/signup')
    }
  }

  const maskedPhone = e164Phone.replace(/(\+\d{2})(\d{6})(\d{4})/, '$1••••••$3')

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={s.root}>
        <HeroHeader height={H * 0.35} title="FirstBridge" subtitle="Welcome back" />

        <Animated.View style={[s.card, { paddingBottom: insets.bottom + 24 }, cardStyle]}>
          <ScrollView
            contentContainerStyle={s.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Back */}
            <TouchableOpacity
              style={s.backBtn}
              onPress={() => router.back()}
              accessibilityLabel="Go back"
            >
              <Ionicons name="chevron-back" size={20} color={Colors.primary} />
            </TouchableOpacity>

            <Text style={s.title}>Welcome back</Text>
            <Text style={s.sub}>Sign in to continue your journey</Text>

            {/* Error banner */}
            {banner && (
              <View style={s.banner}>
                <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
                <Text style={s.bannerTxt}>{banner}</Text>
              </View>
            )}

            {/* Phone input */}
            <PhoneInput
              value={rawPhone}
              onChange={(raw, e164, valid) => {
                setRawPhone(raw)
                setE164Phone(e164)
                setPhoneValid(valid)
                setPhoneError(null)
              }}
              error={phoneError ?? undefined}
            />

            {/* Send OTP button */}
            {!otpSent && (
              <Button
                variant="primary"
                size="lg"
                label={sending ? 'Sending…' : 'Send OTP →'}
                fullWidth
                loading={sending}
                disabled={!phoneValid}
                onPress={handleSendOTP}
              />
            )}

            {/* OTP section — slides down after send */}
            <Animated.View style={otpStyle}>
              <View style={s.otpSection}>
                <Text style={s.otpHint}>
                  Enter the 6-digit code sent to{' '}
                  <Text style={s.otpPhone}>{maskedPhone}</Text>
                </Text>

                <OTPInput onComplete={handleVerify} disabled={verifying} />

                {otpError && (
                  <Text style={s.otpError}>{otpError}</Text>
                )}

                {/* Resend */}
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
                  label={verifying ? 'Verifying…' : 'Verify & Sign In →'}
                  fullWidth
                  loading={verifying}
                  onPress={() => {}}
                />

                {/* Change number */}
                <TouchableOpacity
                  style={s.changeRow}
                  onPress={() => { setOtpSent(false); setRawPhone(''); setE164Phone(''); setPhoneValid(false) }}
                >
                  <Text style={s.changeTxt}>Change number</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Divider */}
            <View style={s.divRow}>
              <View style={s.divLine} />
              <Text style={s.divTxt}>or</Text>
              <View style={s.divLine} />
            </View>

            <Button
              variant="google"
              size="lg"
              label="Continue with Google"
              fullWidth
              onPress={handleGoogle}
            />

            <View style={s.signupRow}>
              <Text style={s.signupTxt}>New here? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                <Text style={s.signupLink}>Sign up</Text>
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
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop:        Spacing.xl,
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
    marginBottom:    Spacing.sm,
  },

  title: { fontFamily: FontFamily.displayBold, fontSize: FontSize.xl,  color: Colors.textPrimary },
  sub:   { fontFamily: FontFamily.body,        fontSize: FontSize.sm,  color: Colors.textSecondary, marginBottom: 4 },

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

  otpSection: { gap: Spacing.md },
  otpHint:    { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center' },
  otpPhone:   { fontFamily: FontFamily.bodySemiBold, color: Colors.primary },
  otpError:   { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: Colors.error, textAlign: 'center' },

  resendRow:    { flexDirection: 'row', justifyContent: 'center' },
  countdown:    { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: Colors.textSecondary },
  countdownNum: { fontFamily: FontFamily.bodySemiBold, color: Colors.primary },
  resendLink:   { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm, color: Colors.accent },

  changeRow: { alignItems: 'center' },
  changeTxt: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: Colors.textSecondary },

  divRow:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  divLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  divTxt:  { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: Colors.textSecondary },

  signupRow:  { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signupTxt:  { fontFamily: FontFamily.body,         fontSize: FontSize.sm, color: Colors.textSecondary },
  signupLink: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm, color: Colors.accent },
})
