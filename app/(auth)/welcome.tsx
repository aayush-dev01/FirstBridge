import { useEffect } from 'react'
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { HeroHeader }  from '../../src/components/auth/HeroHeader'
import { Button }      from '../../src/components/ui/Button'
import { Colors, FontFamily, FontSize, Shadow, Spacing, Radius } from '../../src/lib/theme'
import { signInWithGoogle }   from '../../src/services/auth.service'
import { useAuthStore }       from '../../src/stores/authStore'
import { loadProfile }        from '../../src/services/auth.service'
import { ROLE_ROUTES }        from '../../src/lib/theme'

const { height: H } = Dimensions.get('window')

export default function WelcomeScreen() {
  const router  = useRouter()
  const insets  = useSafeAreaInsets()
  const { setUser, setProfile, setLoading } = useAuthStore()

  const cardY = useSharedValue(200)
  const cardO = useSharedValue(0)

  useEffect(() => {
    cardY.value = withSpring(0, { mass: 0.7, damping: 20, stiffness: 220 })
    cardO.value = withTiming(1, { duration: 220 })
  }, [])

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardY.value }],
    opacity:   cardO.value,
  }))

  const handleGoogle = async () => {
    setLoading(true)
    const { user, isNewUser, error } = await signInWithGoogle()
    setLoading(false)

    if (error || !user) return

    setUser(user)

    if (isNewUser) {
      router.push('/(auth)/signup')
      return
    }

    const profile = await loadProfile(user.id)
    if (profile) {
      setProfile(profile)
      router.replace(ROLE_ROUTES[profile.role] as never)
    } else {
      router.push('/(auth)/signup')
    }
  }

  return (
    <View style={s.root}>
      <HeroHeader
        height={H * 0.42}
        subtitle="Scholarship · Mentorship · Community"
      />

      <Animated.View style={[s.card, { paddingBottom: insets.bottom + 24 }, cardStyle]}>
        <ScrollView
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={s.title}>Welcome to FirstBridge 👋</Text>
          <Text style={s.sub}>
            Connecting students, scholars, mentors and donors to build better futures.
          </Text>

          <Button
            variant="primary"
            size="lg"
            label="Get Started"
            fullWidth
            onPress={() => router.push('/(auth)/signup')}
          />

          <View style={s.divRow}>
            <View style={s.divLine} />
            <Text style={s.divTxt}>or continue with</Text>
            <View style={s.divLine} />
          </View>

          <Button
            variant="google"
            size="lg"
            label="Continue with Google"
            fullWidth
            onPress={handleGoogle}
          />

          <Button
            variant="ghost"
            size="md"
            label="I already have an account"
            fullWidth
            onPress={() => router.push('/(auth)/login')}
          />

          <Text style={s.footer}>
            By continuing you agree to our{' '}
            <Text style={s.footerLink}>Terms</Text>
            {' & '}
            <Text style={s.footerLink}>Privacy Policy</Text>
          </Text>
        </ScrollView>
      </Animated.View>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },

  card: {
    flex:                  1,
    backgroundColor:       Colors.surface,
    borderTopLeftRadius:   Radius.xxl,
    borderTopRightRadius:  Radius.xxl,
    marginTop:             -Radius.xxl,
    ...Shadow.lg,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop:        Spacing.xl,
    gap:               Spacing.md,
  },

  title: {
    fontFamily:   FontFamily.displayBold,
    fontSize:     FontSize.xl,
    color:        Colors.textPrimary,
    marginBottom: 4,
  },
  sub: {
    fontFamily:   FontFamily.body,
    fontSize:     FontSize.sm,
    color:        Colors.textSecondary,
    lineHeight:   20,
    marginBottom: Spacing.sm,
  },

  divRow:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  divLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  divTxt:  { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: Colors.textSecondary },

  footer:     { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center', lineHeight: 18 },
  footerLink: { color: Colors.primary, fontFamily: FontFamily.bodySemiBold },
})
